import {GeneratePassword} from 'js-generate-password';
import  MailSlurp  from 'mailslurp-client';
import { faker } from '@faker-js/faker';
import { test, expect} from '@playwright/test';
import { config } from "dotenv";

config({path: '../.env'});   // load environment variables from .env file

const endpoint = 'https://vigil.lendsqr.com/pecunia/api/v2/onboard';
const header = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Origin': 'https://app.adjutor.io',
    'Referer': 'https://app.adjutor.io',
    'Connection': 'keep-alive',
    'x-api-key': 'P5cuQ6v3lkTdZQzejgeEE0VHcD2sf2xaXTDH1P5R'
}

const apiKey = process.env.MAILSLURP_API_KEY;
if (!apiKey) {throw new Error("MAILSLURP_API_KEY is not defined")}
const mailslurp = new MailSlurp({apiKey});      // create a new instance of MailSlurp

test('Validate Account creation by entering valid and accurate credentials', async ({request}) => {
    const inbox = await mailslurp.inboxController.createInboxWithDefaults();
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            name:faker.person.fullName(),
            password:GeneratePassword({symbols: true, minLengthSymbols: 1}),
            email: inbox.emailAddress,
            phone_number:"23480"+GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false}),
            locale:"en-US",
            business_name:faker.company.name(),
            rc_number:GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false})
        }
    })
    expect.soft(response.status()).toBe(200);    // OK
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");
});


test('Validate Account creation by omitting or skipping random Input fields', async ({request}) => {
    const inbox = await mailslurp.inboxController.createInboxWithDefaults();
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            name:"",
            password:GeneratePassword({symbols: true, minLengthSymbols: 1}),
            email:inbox.emailAddress,
            phone_number:"23490"+GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false}),
            locale:"en-US",
            business_name:"Kelvin Xchange",
            rc_number:""
        }
    })
    expect.soft(response.status()).toBe(400);    // Bad request
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("is not allowed to be empty");
});


test('Validate Account creation by providing existing account credentials', async ({request}) => {
    const inbox = await mailslurp.inboxController.createInboxWithDefaults();
    const address = inbox.emailAddress
    const pass = GeneratePassword({symbols: true, minLengthSymbols: 1});
    const num = GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false});
    // create first account
    await request.post(endpoint, {
        headers: header,
        data: {
            name:"Regalia Sampson",
            password: pass,
            email: address,
            phone_number:"23490"+num,
            locale:"en-US",
            business_name:"Ritzle Xchange",
            rc_number:"1719080"
        }
    })
    // use same credentials of first account to create another
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            name:"Regalia Sampson",
            password: pass,
            email: address,
            phone_number:"23490"+num,
            locale:"en-US",
            business_name:"Ritzle Xchange",
            rc_number:"1719080"
        }
    })
    expect.soft(response.status()).toBe(400);    // 409 Conflict
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("already exists");
});


test('Validate Account creation by providing email address with Invalid domain or special characters', async ({request}) => {
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            name:"John Cuban",
            password:GeneratePassword({symbols: true, minLengthSymbols: 1}),
            email:"kelvinpanther2000@gmail.invalid",
            phone_number:"23490"+GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false}),
            locale:"en-US",
            business_name:"Kelvin Xchange",
            rc_number:"1712348"
        }
    })
    expect.soft(response.status()).toBe(400);    // Bad request
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Unable to verify email");
});


test('Validate Account creation by providing an invalid phone number', async ({request}) => {
    const inbox = await mailslurp.inboxController.createInboxWithDefaults();
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            name:"John Cuban",
            password:GeneratePassword({symbols: true, minLengthSymbols: 1}),
            email: inbox.emailAddress,
            phone_number:"23490427443238723790230",
            locale:"en-US",
            business_name:"Kelvin Xchange",
            rc_number:"1712348"
        }
    })
    expect.soft(response.status()).toBe(400);    // Bad request
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid phone number");
});


test('Validate Account creation by providing Full name, Business name and RC number with special characters of arbitrary length', async ({request}) => {
    const inbox = await mailslurp.inboxController.createInboxWithDefaults();
    const response = await request.post(endpoint, {
        headers: header,
        data: {
            name:"********",
            password:GeneratePassword({symbols: true, minLengthSymbols: 1}),
            email: inbox.emailAddress,
            phone_number:"23480"+GeneratePassword({length:8, numbers:true, lowercase:false, uppercase:false}),
            locale:"en-US",
            business_name:"#########",
            rc_number:"~~~~~~~~~"
        }
    })
    expect.soft(response.status()).toBe(400);    // Bad request
    const body = await response.json();
    expect.soft(body.status).toContain("error");
});