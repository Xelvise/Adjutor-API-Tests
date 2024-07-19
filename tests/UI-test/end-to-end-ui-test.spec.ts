import {GeneratePassword} from 'js-generate-password';
import * as cheerio from 'cheerio';
import  MailSlurp  from 'mailslurp-client';
import { MatchOptionFieldEnum, MatchOptionShouldEnum } from 'mailslurp-client';
import { faker } from '@faker-js/faker';
import { test, expect} from '@playwright/test';
import { config } from "dotenv";

config({path: '../.env'});   // load environment variables from .env file

const apiKey = process.env.MAILSLURP_API_KEY;
if (!apiKey) {throw new Error("MAILSLURP_API_KEY is not defined")}
// create a new instance of MailSlurp
const mailslurp = new MailSlurp({apiKey});

// function to confirm User's email address [Validate account]
async function confirmEmail(inbox_id: string) {
    try {
        const confirmation_mail = await mailslurp.waitController.waitForMatchingFirstEmail({
            inboxId: inbox_id,
            unreadOnly: true,
            timeout: 10*60*1000,    // 10 minutes
            matchOptions: {
                matches: [{value: "Validate your account", field: MatchOptionFieldEnum.SUBJECT, should: MatchOptionShouldEnum.CONTAIN}]
            }
        })
        const content = await mailslurp.emailController.getEmailLinks({emailId: confirmation_mail.id});
        console.log(`Extracted URL - ${content.links[2]}`);
        return content.links[2];    // return the URL to complete account setup
    } catch (error) {
        console.error("Could not retrieve Account setup URL because no mail was sent", error);
    }
}

// function to retrieve 2FA OTP from User's email
async function retrieveOTP(inbox_id: string) {
    try {
        const htmlOTP = await mailslurp.waitController.waitForMatchingFirstEmail({
            inboxId: inbox_id,
            unreadOnly: true,
            timeout: 5*60*1000,   // 5 minutes
            matchOptions: {
                matches: [{ value: "did you log in from a new location", field: MatchOptionFieldEnum.SUBJECT, should: MatchOptionShouldEnum.CONTAIN }]
            }
        });
        if (!htmlOTP.body) {
            throw new Error("Failed to retrieve email");
        }
        const body = cheerio.load(htmlOTP.body);
        const OTP = body('body > center > div > table > tbody > tr:nth-child(1) > td > table > tbody > tr:nth-child(3) > td > p:nth-child(2) > b:nth-child(2)').text()
        console.log(`Extracted OTP - ${OTP}`);
        if (!OTP || OTP.length!==6) {
            throw new Error("OTP is not 6 digits");
        }
        return OTP;
    } catch (error) {
        console.error("Could not retrieve OTP because none was sent", error);
    }
}

// define a function to generate valid account credentials
async function generateCredentials() {
    try {
        const inbox = await mailslurp.inboxController.createInboxWithDefaults();
        if (!inbox.id && !inbox.emailAddress) {     // checks if inbox has been created
            throw new Error("Failed to create inbox")
        };
        const password = "@#"+GeneratePassword();
        console.log(`Email: ${inbox.emailAddress} \nPassword: ${password}`);
        return {inbox_id: inbox.id, emailAddress: inbox.emailAddress, passcode: password};
    } catch (error) {"Failed to retrieve credentials"}
}


// define a function to create a new account, confirm email address and return account credentials
test.describe('POS - Validate User onboarding, confirmation and login operation using valid credentials and OTP', () => {
    test.describe.configure({mode: 'serial'});
    let inboxID: string, email: string, password: string;   // declare variables to store inbox ID, email and password

    test('Validate User onboarding', async ({page}) => {
        const credentials = await generateCredentials();
        if (!credentials) {
            throw new Error("Failed to retrieve credentials");
        }
        const {inbox_id, emailAddress, passcode} = credentials;
        inboxID = inbox_id; email = emailAddress; password = passcode;      // store credentials for later use
        await page.goto("https://app.adjutor.io/signup", {waitUntil: 'domcontentloaded'});
        await page.locator('input[name="name"]').fill(faker.person.fullName());
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="phone_number"]').pressSequentially(" 80"+GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false}), {delay: 50});
        await page.locator('input[name="business_name"]').fill(faker.company.name());
        await page.locator('input[name="rc_number"]').fill(GeneratePassword({length:7, numbers:true, lowercase:false, uppercase:false}));
        await page.locator('input[name="password"]').fill(password);

        // checks if Continue button is enabled on signup form before clicking
        await expect.soft(page.getByRole('button', {name:'Continue'})).toBeEnabled();     // else, throw new Error("Continue button is disabled");
        await page.getByRole('button', {name:'Continue'}).click();

        // checks if "Confirm Account" popup window is visible
        await expect.soft(page.locator('.rsw_2f > div')).toBeVisible();     // else, throw new Error("Account creation failed");          
    });


    test('Validate User account confirmation and Login', async ({page}) => {
        const setupURL = await confirmEmail(inboxID);
        expect(setupURL).toBeTruthy();
        // begin awaiting successful Account confirmation response even before navigating to setup URL
        if (setupURL) {
            const setupEvent = page.waitForResponse(response => 
                response.url().includes('https://vigil.lendsqr.com/pecunia/api/v2/onboard/complete') && response.status()===200 && response.request().method()==='PUT'
            );
            await page.goto(setupURL);
            await setupEvent;
        }
        
        // checks if User account is successfully confirmed
        await expect.soft(page.getByRole('button', {name: 'Let\'s go'})).toBeVisible();    // else, throw new Error("Failed to confirm email address");
        await page.getByRole('button', {name:'Let\'s go'}).click();    // Switches to login page
    
        // cohecks if current page is actually login page
        expect.soft(page.url()).toContain("https://app.adjutor.io/login");    // else, throw new Error("Failed to redirect to login page");

        // fills login form with retrieved email and password
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);
        await page.getByRole('button', {name:'Login', exact:true}).click();
        await page.waitForLoadState('networkidle');

        // retrieve OTP from User's email
        const otp = await retrieveOTP(inboxID);
        if (!otp) {
            throw new Error("Failed to retrieve OTP");
        }        
        await page.getByLabel('Please enter OTP character 1').fill(otp[0]);
        await page.getByLabel('Please enter OTP character 2').fill(otp[1]);
        await page.getByLabel('Please enter OTP character 3').fill(otp[2]);
        await page.getByLabel('Please enter OTP character 4').fill(otp[3]);
        await page.getByLabel('Please enter OTP character 5').fill(otp[4]);
        await page.getByLabel('Please enter OTP character 6').fill(otp[5]);
        await page.waitForLoadState();
        expect.soft(page.url()).toBe("https://app.adjutor.io/");
    });


    test('Validate API key retrieval', async ({page}) => {
        await page.goto("https://app.adjutor.io/login", {waitUntil: 'domcontentloaded'});
        await page.locator('input[name="email"]').fill(email);
        await page.locator('input[name="password"]').fill(password);
        const responseEvent = page.waitForResponse(response =>
            response.url().includes('https://vigil.lendsqr.com/pecunia/api/v2/auth/admin/login') && response.status()===200 && response.request().method()==='POST'
        );
        await page.getByRole('button', {name:'Login', exact:true}).click();
        const response = await responseEvent;
        const body = await response.json();

        // retrieve OTP from User's email
        if (body.message==='Enter 2FA token to Authenticate') {     // executes only when specified response is seen to contain the specified text 
            const otp = await retrieveOTP(inboxID);
            if (!otp) {
                throw new Error("Failed to retrieve OTP");
            }        
            await page.getByLabel('Please enter OTP character 1').fill(otp[0]);
            await page.getByLabel('Please enter OTP character 2').fill(otp[1]);
            await page.getByLabel('Please enter OTP character 3').fill(otp[2]);
            await page.getByLabel('Please enter OTP character 4').fill(otp[3]);
            await page.getByLabel('Please enter OTP character 5').fill(otp[4]);
            await page.getByLabel('Please enter OTP character 6').fill(otp[5]);
            await page.waitForLoadState()
            expect.soft(page.url()).toBe("https://app.adjutor.io/");
        }
        expect.soft(page.url()).toBe("https://app.adjutor.io/");

        // Create an app and retrieve API key
        await page.getByRole('button', { name: 'Create an app' }).click();
        await page.getByRole('button', { name: 'Create an App' }).click();
        await page.locator('input[name="name"]').fill(faker.company.name());
        await page.locator('input[name="description"]').fill(faker.company.buzzPhrase());
        await expect.soft(page.getByRole('button', {name: 'Create app'})).toBeDisabled();

        // Selecting entire Credit-Bureaus API scope
        await page.getByText('Credit-Bureaus (0 of 2 scopes').click();
        await page.getByLabel('crcAccess credit reporting').check();
        await page.getByLabel('firstcentralRetrieve credit').check();

        // Create App that accesses the selected API scopes
        await expect.soft(page.getByRole('button', {name: 'Create app'})).toBeEnabled()
        await page.getByRole('button', {name: 'Create app'}).click();
        // confirm visibility of popup window
        await expect.soft(page.locator('#hide-flow-tag-1 > div > div.modal-container.reset-app-modal.open > div._card_card__iA5c1.modal.size-large.modal-center.animate')).toBeVisible();
        // confirm that both App ID and API key fields contain the right values and are non-editable
        await expect.soft(page.locator('input[type="text"]').first()).toBeDisabled();
        await expect.soft(page.locator('input[type="text"]').first()).toHaveAttribute('value');
        await expect.soft(page.locator('input[type="password"]')).toBeDisabled();
        await expect.soft(page.locator('input[type="password"]')).toHaveAttribute('value', /sk_live_[a-zA-Z0-9]{40}/);
        // confirm that both App ID and API key can be copied and pasted to and fro clipboard
        await page.getByTestId('click-to-copy').nth(1).click();
        const clippedID = await page.evaluate("navigator.clipboard.readText()");
        expect.soft(clippedID).toBeTruthy();
        await page.getByTestId('click-to-copy').nth(2).click();
        const clippedKey = await page.evaluate("navigator.clipboard.readText()");
        expect.soft(clippedKey).toContain('sk_live_')
    });
});