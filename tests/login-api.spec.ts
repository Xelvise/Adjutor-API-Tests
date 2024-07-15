import {GeneratePassword} from 'js-generate-password';
import  MailSlurp  from 'mailslurp-client';
import { MatchOptionFieldEnum, MatchOptionShouldEnum } from 'mailslurp-client';

import { test, expect, request } from '@playwright/test';
const endpoint = 'https://vigil.lendsqr.com/pecunia/api/v2/auth/admin/login';
const endpoint_2fa = 'https://vigil.lendsqr.com/pecunia/api/v2/auth/admin/2fa';

const header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://app.adjutor.io',
    'Referer': 'https://app.adjutor.io',
    'Connection': 'keep-alive',
    'Host': 'vigil.lendsqr.com',
    'source': 'YWRqdXRvcg==',
    'x-api-key': 'P5cuQ6v3lkTdZQzejgeEE0VHcD2sf2xaXTDH1P5R'
}
// create a new instance of MailSlurp
const mailslurp = new MailSlurp({ apiKey: "f31f7daea6f3f0982104d1a26b1f4b8f66ea61670e4b21fc338f5b1fb7392769" });

// function to confirm User's email address [Validate account]
async function confirmEmail(inbox_id: string) {
    try {
        const confirmation_mail = await mailslurp.waitController.waitForMatchingFirstEmail({
            inboxId: inbox_id,
            unreadOnly: true,
            timeout: 10*60*1000,
            matchOptions: {
                matches: [{value: "Validate your account", field: MatchOptionFieldEnum.SUBJECT, should: MatchOptionShouldEnum.CONTAIN}]
            }
        })
        // console.log(`Confirmation mail - ${confirmation_mail[0]}`);
        const content = await mailslurp.emailController.getEmailLinks({emailId: confirmation_mail.id});
        console.log(`Extracted URL - ${content.links[2]}`);
        return content.links[2];    // return the URL to complete account setup
    } catch (error) {
        console.error("Encountered an error while confirming email", error);
    }
}

// function to retrieve 2FA code from User's email
async function retrieve2FAtoken(inbox_id: string) {
    try {
        const code_mail = await mailslurp.waitController.waitForMatchingFirstEmail({
            inboxId: inbox_id,
            unreadOnly: true,
            timeout: 5 * 60 * 1000,
            matchOptions: {
                matches: [{ value: "did you log in from a new location", field: MatchOptionFieldEnum.SUBJECT, should: MatchOptionShouldEnum.CONTAIN }]
            }
        });
        if (!code_mail || !code_mail.body) {
            throw new Error("Failed to retrieve email or email body is empty");
        }
        const match = /provide\s+([0-9]{6})/.exec(code_mail.body);
        if (!match || !match[1]) {
            throw new Error("Failed to retrieve 2FA token");
        }
        const code = match[1];
        if (code.length !== 6) {
            throw new Error("2FA token is not 6 digits");
        }
        return code;
    } catch (error) {
        console.error("Encountered an error while retrieving 2FA token", error);
    }
}

// define a function to create a new account, confirm email address and return account credentials
async function getCredentials() {
    try {
        const inbox = await mailslurp.inboxController.createInboxWithDefaults();
        console.log(`New Email Address - ${inbox.emailAddress}`);
        if (!inbox.id && !inbox.emailAddress) {
            throw new Error("Failed to create inbox")
        };
        const pass = GeneratePassword({symbols: true, minLengthSymbols: 1});
        console.log(`User password - ${pass}`)
        const context = await request.newContext();
        const registerationResponse = await context.post('https://vigil.lendsqr.com/pecunia/api/v2/onboard', {
            headers: header,
            data: {
                name:"Helixx Helium",
                password: pass,
                email: inbox.emailAddress,
                phone_number:"23480"+GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false}),
                locale:"en-US",
                business_name:"Dremon Technologies",
                rc_number:"17"+GeneratePassword({length:5, numbers:true, lowercase:false, uppercase:false})
            }
        });
        console.log(`Registeration status - ${registerationResponse.status()}`);
        console.log(await registerationResponse.json());
        if (!registerationResponse.ok()) {
            throw new Error("Failed to create new account");
        }
        const setupURL = await confirmEmail(inbox.id);
        if (!setupURL) {
            throw new Error("Failed to retrieve setup URL");
        }
        // Send an initial GET request to Account confirmation URL
        const clickURL = await request.newContext();
        await clickURL.get(setupURL, {headers: header});

        // Decode URL to extract unencoded component
        const decodedURL = decodeURIComponent(setupURL);
        // Adjust RegExp to stop capturing at first instance of tracking parameters '/1/'
        const parsedURL = decodedURL.match(/https?:\/\/[^\/]+\/L0\/(https?:\/\/[^\/]+\/[^"]+?)(\/1\/|$)/);
        if (!parsedURL || !parsedURL[1]) {
            throw new Error("Failed to extract confirmation URL");
        }
        // Extract token from parsedURL and attach to Authorization
        const httpHeader = {...header, Authorization: 'Bearer '+parsedURL[1].split('token=')[1]};
        const URLcontext = await request.newContext();
        const confirmationResponse = await URLcontext.get('https://vigil.lendsqr.com/pecunia/api/v2/onboard/', {headers: httpHeader});
        console.log(`Account confirmation status - ${confirmationResponse.status()}`);
        console.log(await confirmationResponse.json());
        if (!confirmationResponse.ok()) {
            throw new Error("Failed to confirm email address");
        }
        const onboardContext = await request.newContext();
        const onboardResponse = await onboardContext.put('https://vigil.lendsqr.com/pecunia/api/v2/onboard/complete', {headers: httpHeader});
        console.log(`User onboarding status - ${onboardResponse.status()}`);
        console.log(await onboardResponse.json());
        // if (!onboardResponse.ok()) {
        //     throw new Error("Failed to complete final onboarding");
        // }
        return {
            email: inbox.emailAddress,
            inbox_ID: inbox.id,
            password: pass,
            httpHeader: httpHeader
        };
    } catch (error) {
        console.error(error);
    }
}


// To test login using registered credentials, we retrieve registered User credentials
test('POS - Validate login using registered credentials and 2FA token', async ({request}) => {
    try {
        const credentials = await getCredentials();
        if (!credentials) {
            throw new Error("Failed to retrieve credentials");
        }
        const {email, inbox_ID, password, httpHeader} = credentials;
        const response = await request.post(endpoint, {
            headers: httpHeader,
            data: {
                email: email,
                password: password
            }
        });
        console.log(`Login response status - ${response.status()}`);
        console.log(response.headers());
        const body = await response.json();
        console.log(body);

        if (body.data.is_twofa_enabled === true) {
            const loginkey = body.data.loginKey;
            const responsefrom2FA = await request.post(endpoint_2fa, {
                headers: httpHeader,
                data: {
                    loginKey: loginkey,
                    token: await retrieve2FAtoken(inbox_ID)
                }
            });
            const bodyfrom2FA = await responsefrom2FA.json();
            expect.soft(bodyfrom2FA.status).toContain("success");    // OK
        }
        expect.soft(body.status).toContain("success");    // OK
    } catch (error) {
        console.error(error);
    }
});


// To test login using unregistered credentials, we randomly generate false User credentials
test('NEG - Validate login using registered email and invalid password', async ({request}) => {
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            email: "elvisgideonuzuegbu@gmail.com",
            password: GeneratePassword({symbols: true, minLengthSymbols: 1})
        }
    })
    expect.soft(response.status(), 'Incorrect Login credentials').toBe(400);    // Bad Request
    const body = await response.json();
    console.log(body);
    expect.soft(body.status).toContain("error");    // OK
    expect.soft(body.message).toContain("Incorrect login credentials");    // OK
});


test('NEG - Validate login using unregistered(but valid) email and password', async ({request}) => {
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            email: "xerxes@gmail.com",
            password: GeneratePassword({symbols: true, minLengthSymbols: 1})
        }
    })
    expect.soft(response.status(), 'Incorrect Login credentials').toBe(400);    // Bad Request
    const body = await response.json();
    expect.soft(body.status, 'Login request is unsuccessful').toContain("error");    // OK
    expect.soft(body.message, 'Incorrect Login credentials').toContain("Incorrect login credentials");    // OK
});


test('NEG - Validate login using invalid email and password', async ({request}) => {
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            email: "******************",
            password: "###########"
        }
    })
    expect.soft(response.status(), 'Incorrect Login credentials').toBe(400);    // Bad Request
    const body = await response.json();
    expect.soft(body.status, 'Login request is unsuccessful').toContain("error");    // OK
    expect.soft(body.message, 'Incorrect Login credentials').toContain("Incorrect login credentials");    // OK
});


test('NEG - Validate login with missing credential', async ({request}) => {
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            email: "obiuzuegbu@gmail.com",
            password: ""
        }
    })
    expect.soft(response.status(), 'Bad request').toBe(400);    // Bad Request
    const body = await response.json();
    expect.soft(body.status, 'Login request is unsuccessful').toContain("error");    // OK
    expect.soft(body.message, 'Incorrect Login credentials').toContain("is not allowed to be empty");    // OK
});


test('NEG - Validate password reset using registered email address', async ({request}) => {
    const response = await request.post('https://vigil.lendsqr.com/pecunia/api/v1/auth/reset/admin/password/email', {
        headers: header,
        data: {email: "obiuzuegbu@gmail.com"}
    })
    expect.soft(response.status()).toBe(200);    // OK
    const body = await response.json();
    expect.soft(body.status).toContain("success");    // OK
});


test('NEG - Validate password reset using unregistered email address', async ({request}) => {
    const response = await request.post('https://vigil.lendsqr.com/pecunia/api/v1/auth/reset/admin/password/email', {
        headers: header,
        data: {email: " ****************** "}
    });
    expect.soft(response.status()).toBe(400);    // Bad Request
    const body = await response.json();
    expect.soft(body.status).toContain("error");    // OK
});