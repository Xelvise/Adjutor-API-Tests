import {test, expect} from '@playwright/test';
import { config } from 'dotenv';
config({path: './.env'})

const base_url = 'https://adjutor.lendsqr.com/v2/';
const header = {
    'Authorization': 'Bearer '+process.env.ADJUTOR_API_KEY,
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
const xheader = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};


test('NEG - Initializing BVN consent without authorization header', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN, {
        headers: xheader,
        data: {contact: process.env.BVN_PHONE_NO}
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization")
});


test('POS - Initializing BVN consent using valid 11-digits BVN with a matching correctly-formatted phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN, {
        headers: header,
        data: {contact: process.env.BVN_PHONE_NO}
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("otp");
    expect.soft(body.message).toContain("provide OTP sent to contact");
});


test('NEG - Initializing BVN consent using valid 11-digits BVN with non-matching correctly-formatted phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN, {
        headers: header,
        data: {contact: '08123456789'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("otp");
    expect.soft(body.message).toContain("provide OTP sent to contact");
    expect.soft(body.data).toContain(process.env.BVN_PHONE_NO?.slice(-4));
});


test('NEG - Initializing BVN consent using valid 11-digits BVN with incorrectly-formatted phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN, {
        headers: header,
        data: {contact: '+8132198333'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("otp");
    expect.soft(body.message).toContain("provide OTP sent to contact");
});


test('NEG - Initializing BVN consent using valid 11-digits BVN with missing phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN, {
        headers: header,
        data: {contact: ''}
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not be empty");
});


test('NEG - Initializing BVN consent using invalid 11-digits BVN with correctly-formatted phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/00000000000', {
        headers: header,
        data: {contact: process.env.BVN_PHONE_NO}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("BVN not found");
});


test('NEG - Complete consent and get BVN details using valid 11-digits BVN and invalid or incorrect 6-digits OTP', async ({request}) => {
    const response = await request.put(base_url+'verification/bvn/'+process.env.BVN, {
        headers: header,
        data: {otp: '123456'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("incorrect otp");
});


test('NEG - Complete consent and get BVN details using valid 11-digits BVN and missing OTP', async ({request}) => {
    const response = await request.put(base_url+'verification/bvn/'+process.env.BVN, {
        headers: header,
        data: {otp: ''}
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not be empty");
});


test('NEG - Complete consent and get BVN details using invalid 11-digits BVN and OTP', async ({request}) => {
    const response = await request.put(base_url+'verification/bvn/11111111111', {
        headers: header,
        data: {otp: '123456'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("BVN not found");
});


test('POS - Karma Lookup using valid 11-digits BVN', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/'+process.env.BVN, {
        headers: header
    });
    const body = await response.json();
    expect.soft(body.status).toContain("success");
});


test('NEG - Karma Lookup using invalid 11-digits BVN', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/00000000000', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
});


test('NEG - Karma Lookup using valid 11-digits BVN, but without authorization header', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/'+process.env.BVN, {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization");
});


test('POS - Karma Lookup using valid Phone Number', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/+2348132198333', {
        headers: header
    });
    const body = await response.json();
    expect.soft(body.status).toContain("success");
});


test('POS - Karma Lookup using correctly-formatted Bank code and Acct number', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/'+process.env.BANK_CODE+'-'+process.env.ACCOUNT_NO, {
        headers: header
    });
    const body = await response.json();
    expect.soft(body.status).toContain("success");
});


test('POS - Karma Lookup using incorrectly-formatted Bank code and Acct number', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/'+process.env.ACCOUNT_NO+'-'+process.env.BANK_CODE, {
        headers: header
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
});


test('POS - Karma Lookup using valid Email Address', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/lewisgideon@gmail.com', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("not found");
});


test('POS - Borrower Lookup using valid 11-digits BVN', async({request}) => {
    const response = await request.get(base_url+'verification/ecosystem/'+process.env.BVN, {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not found in ecosystem");    
});


test('NEG - Borrower Lookup using invalid 11-digits BVN ', async({request}) => {
    const response = await request.get(base_url+'verification/ecosystem/11111111111', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
});


test('POS - Verify Customer bank account, given valid 10-digits Acct number and a corresponding Bank code', async ({request}) => {
    const response = await request.post(base_url+'verification/bankaccount', {
        headers: header,
        data: {
            account_number: process.env.ACCOUNT_NO,
            bank_code: process.env.BANK_CODE
        }
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("successful");
    expect.soft(body.message).toContain("Successful");
    expect.soft(body.data.bank_code).toBe(process.env.BANK_CODE);
    expect.soft(body.data.account_number).toBe(process.env.ACCOUNT_NO);
    expect.soft(body.data.bvn).toContain("0000000");
});


test('NEG - Verify Customer bank account, given that Acct number and bank code doesn\'t tally', async ({request}) => {
    const response = await request.post(base_url+'verification/bankaccount', {
        headers: header,
        data: {
            account_number: process.env.ACCOUNT_NO,
            bank_code: '044'
        }
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid");
});


test('NEG - Verify Customer bank account using missing acct number', async ({request}) => {
    const response = await request.post(base_url+'verification/bankaccount', {
        headers: header,
        data: {
            account_number: '',
            bank_code: '044'
        }
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("account number is required");
});


test('NEG - Verify Customer bank account without authorization header', async ({request}) => {
    const response = await request.post(base_url+'verification/bankaccount', {
        headers: xheader,
        data: {
            account_number: process.env.ACCOUNT_NO,
            bank_code: process.env.BANK_CODE
        }
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization");
});

test('NEG - Verify Customer bank account using invalid HTTP method', async ({request}) => {
    const response = await request.put(base_url+'verification/bankaccount', {
        headers: header,
        data: {
            account_number: process.env.ACCOUNT_NO,
            bank_code: process.env.BANK_CODE
        }
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("PUT /v2/verification/bankaccount not found");
});


test('POS - BVN Image comparison with a valid facial image URL', async({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN+'/selfies', {
        headers: header,
        data: {image: process.env.BVN_IMG_URL}
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");
});


test('NEG - BVN Image comparison with an arbitrary non-image URL', async({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN+'/selfies', {
        headers: header,
        data: {image: "https://www.google.com"}
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid url");
});


test('NEG - BVN Image comparison with non-URL', async({request}) => {
    const response = await request.post(base_url+'verification/bvn/'+process.env.BVN+'/selfies', {
        headers: header,
        data: {image: "image.jpg"}
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid url");
});

