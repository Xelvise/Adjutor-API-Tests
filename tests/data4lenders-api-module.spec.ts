import {test, expect} from '@playwright/test';
const base_url = 'https://adjutor.lendsqr.com/v2/';
const header = {
    'Authorization': 'Bearer sk_live_178Bp1Z1KqJEynNVMDOZuYuBjj3EifRxKxWo9dii',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};
const xheader = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};


test('POS - Get data options available for a lender', async ({request}) => {
    const response = await request.get(base_url+'data/options', {
        headers: header
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.meta).toBeTruthy();
    expect.soft(body.success).toBe(true);
    expect.soft(body.data.length).toBeGreaterThanOrEqual(1)
});


test('POS - Get data options available for a lender without authorization header', async ({request}) => {
    const response = await request.get(base_url+'data/options', {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.success).toBe(false);
});


test('POS - Get data options available for a lender specific to Users', async ({request}) => {
    const response = await request.get(base_url+'data/users', {
        headers: header
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.meta).toBeTruthy();
    expect.soft(body.success).toBe(true);
    expect.soft(body.data.length).toBeGreaterThanOrEqual(1)
});


test('POS - Get data options available for a lender specific to Users without authorization header', async ({request}) => {
    const response = await request.get(base_url+'data/users', {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.success).toBe(true);
    expect.soft(body.data.length).toBeGreaterThanOrEqual(1)
});

