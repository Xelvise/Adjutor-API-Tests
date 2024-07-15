import {test, expect} from '@playwright/test';

const base_url = 'https://adjutor.lendsqr.com/v2/';
const header = {
    'Authorization': 'Bearer sk_live_aZ2LFDwTXNajok0TCYUHYc09liT25uKuAVAAfY2T',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
const xheader = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};


test('NEG - Initializing BVN consent without authorization header', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/22511513079', {
        headers: xheader,
        data: {contact: '08132198222'}
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization")
});


test('POS - Initializing BVN consent using valid 11-digits BVN with a matching correctly-formatted phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/22511513079', {
        headers: header,
        data: {contact: '08132198222'}
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("otp");
    expect.soft(body.message).toContain("provide OTP sent to contact");
});


test('NEG - Initializing BVN consent using valid 11-digits BVN with non-matching correctly-formatted phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/22511513079', {
        headers: header,
        data: {contact: '08039425797'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("otp");
    expect.soft(body.message).toContain("provide OTP sent to contact");
    expect.soft(body.data).not.toContain('08039425797');
});


test('NEG - Initializing BVN consent using valid 11-digits BVN with incorrectly-formatted phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/22511513079', {
        headers: header,
        data: {contact: '+8132198222'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("otp");
    expect.soft(body.message).toContain("provide OTP sent to contact");
});


test('NEG - Initializing BVN consent using valid 11-digits BVN with missing phone number', async ({request}) => {
    const response = await request.post(base_url+'verification/bvn/22511513079', {
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
        data: {contact: '08132198222'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("BVN not found");
});


test('NEG - Complete consent and get BVN details using valid 11-digits BVN and invalid or incorrect 6-digits OTP', async ({request}) => {
    const response = await request.put(base_url+'verification/bvn/22511513079', {
        headers: header,
        data: {otp: '123456'}
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("incorrect otp");
});


test('NEG - Complete consent and get BVN details using valid 11-digits BVN and missing OTP', async ({request}) => {
    const response = await request.put(base_url+'verification/bvn/22511513079', {
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
    const response = await request.get(base_url+'verification/karma/22511513079', {
        headers: header
    });
    const body = await response.json();
    expect.soft(body.status).toContain("success");
});


test('NEG - Karma Lookup using invalid 11-digits BVN', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/11111111111', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
});


test('NEG - Karma Lookup using valid 11-digits BVN, but without authorization header', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/22511513079', {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization");
});


test('POS - Karma Lookup using valid Phone Number', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/+2348132198222', {
        headers: header
    });
    const body = await response.json();
    expect.soft(body.status).toContain("success");
});


test('POS - Karma Lookup using correctly-formatted Bank code and Acct number', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/044-0823971284', {
        headers: header
    });
    const body = await response.json();
    expect.soft(body.status).toContain("success");
});


test('POS - Karma Lookup using incorrectly-formatted Bank code and Acct number', async ({request}) => {
    const response = await request.get(base_url+'verification/karma/0823971284-044', {
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
    const response = await request.get(base_url+'verification/ecosystem/22511513079', {
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
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
});


test('POS - Verify Customer bank account, given valid 10-digits Acct number and a corresponding Bank code', async ({request}) => {
    const response = await request.post(base_url+'verification/bankaccount', {
        headers: header,
        data: {
            account_number: '0823971284',
            bank_code: '044'
        }
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("successful");
    expect.soft(body.message).toContain("Successful");
    expect.soft(body.data.bank_code).toBe("044");
    expect.soft(body.data.account_number).toBe("0823971284");
    expect.soft(body.data.bvn).toContain("0000000");
});


test('NEG - Verify Customer bank account, given that Acct number and bank code doesn\'t tally', async ({request}) => {
    const response = await request.post(base_url+'verification/bankaccount', {
        headers: header,
        data: {
            account_number: '2122228049',
            bank_code: '044'
        }
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not found");
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
            account_number: '2122228049',
            bank_code: '033'
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
            account_number: '0823971284',
            bank_code: '044'
        }
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("PUT not found");
});


test('POS - BVN Image comparison with a valid facial image URL', async({request}) => {
    const response = await request.post(base_url+'verification/bvn/22511513079/selfies', {
        headers: header,
        data: {image: 'https://lh3.googleusercontent.com/u/0/drive-viewer/AKGpihZVBTZcvXk2vJNQygKb6FWYylpvnCnKE270VN9T5ELBqlqEx-5cHT2B5QZcSyPnN6bVTuq2neqTUTgPWM-aLCb_VVZ5e9tQqYU=w1043-h278-rw-v1'}
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");
    expect.soft(body.data.match).toBe(true);
    expect.soft(body.data.similarity).toBeGreaterThanOrEqual(50.0)
});


test('NEG - BVN Image comparison with an arbitrary image URL', async({request}) => {
    const response = await request.post(base_url+'verification/bvn/22511513079/selfies', {
        headers: header,
        data: {image: 'https://media.istockphoto.com/id/685132245/photo/mature-businessman-smiling-over-white-background.jpg?s=2048x2048&w=is&k=20&c=Wj899u_hLD8DN3dHzNnzwnwNOS2zrqzfYML_RW82mUI='}
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");
    expect.soft(body.data.match).toBe(false);
});

