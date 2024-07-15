import {test, expect} from '@playwright/test';

test('Validate Account creation by filling all Input fields with accurate details only', async ({page}) => {
    await page.goto("https://app.adjutor.io/signup");
    await page.locator('div.input-container > div > input[name="name"]').fill('Krish Naik');
    await page.locator('div.input-container > div > input[name="email"]').fill('julius@gmail.com');
    await page.waitForSelector('input[name="phone_number"]', {state: 'visible'});
    const mob_no = await page.locator('input[name="phone_number"]').getAttribute('value');

    if (mob_no === '+234') {
        await page.locator('input[name="phone_number"]').fill('8039425798');
    } else {
        await page.locator('div.flag-dropdown.open').click();
        await page.locator('div.flag-dropdown.open > ul.country-list > li[data-flag-key="flag_no_1"]').click();
        await page.locator('input[name="phone_number"]').fill('8039425798');
    }
    await page.locator('div.input-container > div > input[name="business_name"]').fill('Krish Xchange');
    await page.locator('div.input-container > div > input[name="rc_number"]').fill('1713242');
    await page.locator('div.input-container > div > input[name="password"]').fill('Hello@123');

    // expecting no 'Required' alerts, having filled up all Input fields
    await expect(page.locator('div.input-container > label.error-message.xs')).toBeHidden();

    await page.locator('button[type="submit"]').click();

    // Resend email button indicates User has been successfully registered
    // expecting Resend email button to be visible in DOM
    await expect(page.getByRole('button', {name: 'Resend email'})).toBeVisible({timeout: 10000});
});


test('Validate Account creation by omitting or skipping certain Input fields', async ({page}) => {
    // Here, we'd be skipping Business name and RC number
    await page.goto("https://app.adjutor.io/signup");
    await page.locator('div.input-container > div > input[name="name"]').fill('Lady Gaga');
    await page.locator('div.input-container > div > input[name="email"]').fill('julius@gmail.com');
    await page.waitForSelector('input[name="phone_number"]', {state: 'visible'});
    const mob_no = await page.locator('input[name="phone_number"]').getAttribute('value', {timeout: 5000});

    if (mob_no === '+234') {
        await page.locator('input[name="phone_number"]').fill('8039425798');
        // console.log("Mobile number is +234");
    } else {
        await page.locator('div.flag-dropdown.open').click();
        await page.locator('div.flag-dropdown.open > ul.country-list > li[data-flag-key="flag_no_1"]').click();
        await page.locator('input[name="phone_number"]').fill('8039425798');
    }
    await page.locator('div.input-container > div > input[name="business_name"]').fill('');
    await page.locator('div.input-container > div > input[name="rc_number"]').fill('');
    await page.locator('div.input-container > div > input[name="password"]').fill('Hello@123');

    // expecting 'Required' alerts to be visible, having skipped Business name and RC number
    await expect(page.locator('div.input-container > label.error-message.xs').first()).toBeVisible();
    // expecting the Continue button to be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
})


test.only('Validate Account creation by filling RC number with arbitrary value and length', async ({page}) => {
    await page.goto("https://app.adjutor.io/signup");
    await page.locator('div.input-container > div > input[name="name"]').fill('Lady Gaga');
    await page.locator('div.input-container > div > input[name="email"]').fill('julius@gmail.com');
    await page.locator('input[name="phone_number"]').fill('8039425798');
    // const mob_no = await page.locator('input[name="phone_number"]').getAttribute('value');

    // if (mob_no == '+234') {
    //     await page.locator('input[name="phone_number"]').fill('8039425798');
    // } else {
    //     await page.locator('div.flag-dropdown.open').click();
    //     await page.locator('div.flag-dropdown.open > ul.country-list > li[data-flag-key="flag_no_1"]').click();
    //     await page.locator('input[name="phone_number"]').fill('8039425798');
    // }
    await page.locator('div.input-container > div > input[name="business_name"]').fill('Krish Xchange');
    await page.locator('div.input-container > div > input[name="rc_number"]').fill('qwngyiewrqgciqw');
    await page.locator('div.input-container > div > input[name="password"]').fill('Hello@123');

    // expecting an error alert to be visible, having inputted arbitrary value as RC number
    await expect.soft(page.getByText('Invalid RC number')).toBeEmpty();

    // expecting the Continue button to be disabled
    await expect.soft(page.locator('button[type="submit"]')).toBeDisabled();
});


test('Validate Account creation by filling Email field with invalid email address', async ({page}) => {
    await page.goto("https://app.adjutor.io/signup", {waitUntil: 'networkidle'});
    await page.locator('div.input-container > div > input[name="name"]').fill('Lady Gaga');
    await page.locator('div.input-container > div > input[name="email"]').fill('julius@gmail.invalid');
    await page.waitForSelector('input[name="phone_number"]', {state: 'visible'});
    const mob_no = await page.locator('input[name="phone_number"]').getAttribute('value');

    if (mob_no === '+234') {
        await page.locator('input[name="phone_number"]').fill('8039425798');
        // console.log("Mobile number is +234");
    } else {
        await page.locator('div.flag-dropdown.open').click();
        await page.locator('div.flag-dropdown.open > ul.country-list > li[data-flag-key="flag_no_1"]').click();
        await page.locator('input[name="phone_number"]').fill('8039425798');
    }
    await page.locator('div.input-container > div > input[name="business_name"]').fill('Krish Xchange');
    await page.locator('div.input-container > div > input[name="rc_number"]').fill('1713242');
    await page.locator('div.input-container > div > input[name="password"]').fill('Hello@123');

    // expecting the error alert to contain text 'Invalid email', if it's visible
    if (await page.locator('div.input-container > label.error-message.xs').isVisible()) {
        await expect(page.locator('div.input-container > label.error-message.xs')).toContainText('Invalid email');
        await expect(page.locator('button[type="submit"]')).toBeDisabled();
    } else {
        // expecting Email confirmation popup to be hidden from DOM
        await page.locator('button[type="submit"]').click();
        await expect(page.getByRole('button', {name: 'Resend email'})).toBeHidden();
    }
})


test('Validate Account creation by providing Full name, Business name and RC number with special characters', async ({page}) => {
    await page.goto("https://app.adjutor.io/signup");
    await page.locator('div.input-container > div > input[name="name"]').fill('@@@@@@@@@@');
    await page.locator('div.input-container > div > input[name="email"]').fill('julius@gmail.com');
    await page.waitForSelector('input[name="phone_number"]', {state: 'visible'});
    const mob_no = await page.locator('input[name="phone_number"]').getAttribute('value');

    if (mob_no === '+234') {
        await page.locator('input[name="phone_number"]').fill('8039425798');
        console.log("Mobile number is +234");
    } else {
        await page.locator('div.flag-dropdown.open').click();
        await page.locator('div.flag-dropdown.open > ul.country-list > li[data-flag-key="flag_no_1"]').click();
        await page.locator('input[name="phone_number"]').fill('8039425798');
    }
    await page.locator('div.input-container > div > input[name="business_name"]').fill('$$$$$$$$');
    await page.locator('div.input-container > div > input[name="rc_number"]').fill('**********');
    await page.locator('div.input-container > div > input[name="password"]').fill('Hello@123');

    // expecting an error alert to be visible, having entered special characters in Full name, Business name and RC number fields
    await expect(page.locator('div.input-container > label.error-message.xs')).toBeVisible();

    // expecting the Continue button to be disabled
    await expect(page.locator('button[type="submit"]')).toBeDisabled();
    
    // expecting Email confirmation popup to be hidden from DOM
    await page.locator('button[type="submit"]').click();
    await expect(page.getByRole('button', {name: 'Resend email'})).toBeHidden();

});


// test.only('Browser Context-validating error login', async ({page}) => {
//     await page.goto('https://rahulshettyacademy.com, {waitUntil: 'networkidle'});
//     await page.locator("#userEmail").fill('anshika@gmail.com');
//     await page.locator("#userPassword").fill("Iamking@000");
//     await page.locator("input[value*='gin']").click();
//     const contents = await page.locator(".card-body b")
// });