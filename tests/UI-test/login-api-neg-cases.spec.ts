import {GeneratePassword} from 'js-generate-password';
import { test, expect} from '@playwright/test';
import { config } from "dotenv";

config({path: '../.env'});   // load environment variables from .env file

const endpoint = 'https://vigil.lendsqr.com/pecunia/api/v2/auth/admin/login';
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
        data: {email: " talisman001@gmail.com "}
    });
    expect.soft(response.status()).toBe(400);    // Bad Request
    const body = await response.json();
    console.log(body.message)
    expect.soft(body.status).toContain("error");    // OK
});