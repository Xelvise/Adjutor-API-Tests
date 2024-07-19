import {test, expect} from '@playwright/test';
import { config } from 'dotenv';
config({path: '../.env'})

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

test('POS - Get Credit report from CRC using valid 11-digits BVN', async ({request}) => {
    const response = await request.get(base_url+'creditbureaus/crc/'+process.env.BVN, {
        headers: header
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");
});


test('POS - Get Credit report from CRC using invalid 11-digits BVN', async ({request}) => {
    const response = await request.get(base_url+'creditbureaus/crc/11111111111', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("BVN not found");
});


test('POS - Get Credit report from CRC using valid 11-digits BVN without authorization header', async ({request}) => {
    const response = await request.get(base_url+'creditbureaus/crc/'+process.env.BVN, {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("unauthorized");
});


test('POS - Get Credit report from FirstCentral Credit Bureau using valid 11-digits BVN', async ({request}) => {
    const response = await request.get(base_url+'creditbureaus/firstcentral/'+process.env.BVN, {
        headers: header
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");
});


test('POS - Get Credit report from FirstCentral Credit Bureau using invalid 11-digits BVN', async ({request}) => {
    const response = await request.get(base_url+'creditbureaus/firstcentral/00000000000', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("BVN not found");
});


test('POS - Get Credit report from FirstCentral Credit Bureau using valid 11-digits BVN without authorization header', async ({request}) => {
    const response = await request.get(base_url+'creditbureaus/firstcentral/'+process.env.BVN, {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("unauthorized");
});