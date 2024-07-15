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

test('POS -  Get all banks providing direct debit services within a valid limit range of 100', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/banks?limit=100&page=1&sort_dir=ASC', {
        headers: header
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("success");
    expect.soft(body.meta).toBeTruthy();
});

test('EDGE - Get all banks providing direct debit services by applying out-of-range page filter', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/banks?limit=100&page=100000&sort_dir=ASC', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not found");
    expect.soft(body.meta).toBeTruthy();
});

test('NEG - Get all banks providing direct debit services (without authorization header)', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/banks?limit=100&page=1&sort_dir=ASC', {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization");
});


test('POS - Retrieve details of a specific bank, given bank_id', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/banks/1', {
        headers: header
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("success");
    expect.soft(body.meta).toBeTruthy();
});


test('NEG - Retrieve details of a specific bank, given bank_id (without authorization header)', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/banks/1', {
        headers: xheader
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization");
});


test('NEG - Retrieve details of a specific bank, given invalid bank ID', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/banks/0', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not found");
    expect.soft(body.meta).toBeTruthy();
});


test('POS - Verify bank account number using valid account number and corresponding bank code', async ({request}) => {
    const response = await request.post(base_url+'direct-debit/banks/account-lookup', {
        headers: header,
        data: {
            account_number: "0823971284",
            bank_code: "044"
        }
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("success");
    expect.soft(body.data.bvn).toContain("0000000");
    expect.soft(body.meta).toBeTruthy();
});


test('NEG - Verify bank account number using valid account number and missing code', async ({request}) => {
    const response = await request.post(base_url+'direct-debit/banks/account-lookup', {
        headers: header,
        data: {
            account_number: "0823971284",
            bank_code: ""
        }
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not be empty");
    expect.soft(body.meta).toBeTruthy();
});


test('NEG - Verify bank account number using valid account number and corresponding bank code (without authorization header)', async ({request}) => {
    const response = await request.post(base_url+'direct-debit/banks/account-lookup', {
        headers: xheader,
        data: {
            account_number: "0823971284",
            bank_code: "044"
        }
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization");
});

test.describe('Validating Creation, Retrieval and deletion of E-mandate in sequence', async () => {
    test.describe.configure({mode: 'serial'});
    let ref_num = "";

    test('POS - Verify E-mandate creation, given valid and required account credentials', async ({request}) => {
        const response = await request.post(base_url+'direct-debit/mandates', {
            headers: header,
            data: {
                account_number: "2238353521",
                phone_number: "08132198222",
                debit_type: "full",
                bank_id: "033",
                email: "elvisgideonuzuegbu@gmail.com",
                start_date: "2025-01-01",
                end_date: "2025-01-10",
                narration: "Mandate for computer loan",
                address: "69 Somewhere Street, Ebutte Metta Lagos",
                amount: 1000
            }
        });
        expect.soft(response).toBeOK();
        const body = await response.json();
        ref_num = body.data.reference_number;      // store mandate id for future use
        expect.soft(body.status).toContain("success");
        expect.soft(body.message).toContain("Mandate created successfully");
        expect.soft(body.data.account_number).toBe("2238353521");
        expect.soft(body.data.start_date).toContain("2025-01-01");
        expect.soft(body.data.end_date).toContain("2025-01-10");
        expect.soft(body.meta).toBeTruthy();
    });

    test('POS - Retrieve specific mandate details, given valid reference_number', async ({request}) => {
        const response = await request.get(base_url+'direct-debit/mandates?reference_number='+ref_num, {
            headers: header
        });
        expect.soft(response).toBeOK();
        const body = await response.json();
        expect.soft(body.status).toContain("success");
        expect.soft(body.message).toContain("success");
        expect.soft(body.data.data[0].reference_number).toBe(ref_num);
        expect.soft(body.data.data[0].account_number).toBe("2238353521");
        expect.soft(body.data.data[0].start_date).toContain("2025-01-01");
        expect.soft(body.data.data[0].end_date).toContain("2025-01-10");
        expect.soft(body.meta).toBeTruthy();
    });

    test('POS - Retrieve all mandates created within a valid limit range of 10', async ({request}) => {
        const response = await request.get(base_url+'direct-debit/mandates?limit=10&page=1', {
            headers: header
        });
        expect.soft(response).toBeOK();
        const body = await response.json();
        expect.soft(body.status).toContain("success");
        expect.soft(body.message).toContain("success");
        expect.soft(body.data.data[0].reference_number).toBe(ref_num);
        expect.soft(body.data.data[0].account_number).toBe("2238353521");
        expect.soft(body.data.data[0].start_date).toContain("2025-01-01");
        expect.soft(body.data.data[0].end_date).toContain("2025-01-10");
        expect.soft(body.meta).toBeTruthy();
    });

    test('POS - Retrieve balance of account associated with a mandate (identified by ref number)', async ({request}) => {
        const response = await request.post(base_url+'direct-debit/banks/balance-lookup', {
            headers: header,
            data: {reference_number: ref_num}
        });
        expect.soft(response).toBeOK();
        const body = await response.json();
        expect.soft(body.status).toContain("success");
        expect.soft(body.message).toContain("success");
        expect.soft(body.meta).toBeTruthy();
    });

    test('POS - Get mandate summary', async ({request}) => {
        const response = await request.get(base_url+'direct-debit/mandates/stats', {
            headers: header
        });
        expect.soft(response).toBeOK();
        const body = await response.json();
        expect.soft(body.status).toContain("success");
        expect.soft(body.message).toContain("success");
        expect.soft(body.data[0]).toBeTruthy();
        expect.soft(body.meta).toBeTruthy();
    });

    test('POS - Cancel account mandate, given an existing valid ref number', async ({request}) => {
        const response = await request.patch(base_url+'direct-debit/mandates/cancel', {
            headers: header,
            data: {reference_number: ref_num}
        });
        expect.soft(response).toBeOK();
        const body = await response.json();
        expect.soft(body.status).toContain("success");
        expect.soft(body.message).toContain("success");
        expect.soft(body.meta).toBeTruthy();
    });

    test('POS - Verifying canceled mandate (identified by ref number) has been canceled', async ({request}) => {
        const response = await request.get(base_url+'direct-debit/mandates?reference_number='+ref_num, {
            headers: header
        });
        expect.soft(response.status()).toBe(400);
        const body = await response.json();
        expect.soft(body.status).toContain("error");
        expect.soft(body.message).toContain("Cannot cancel a mandate that is cancelled");
        expect.soft(body.meta).toBeTruthy();
    });
    
    test('POS - Balance enquiry on account associated with an inactive (or cancelled) mandate', async ({request}) => {
        const response = await request.post(base_url+'direct-debit/banks/balance-lookup', {
            headers: header,
            data: {reference_number: ref_num}
        });
        expect.soft(response.status()).toBe(400);
        const body = await response.json();
        expect.soft(body.status).toContain("error");
        expect.soft(body.message).toContain("Can only perform balance enquiry on an active mandate");
        expect.soft(body.meta).toBeTruthy();
    });
});


test('NEG - Verify E-mandate creation, given valid and required account credentials but without authorization header', async ({request}) => {
    const response = await request.post(base_url+'direct-debit/mandates', {
        headers: xheader,
        data: {
            account_number: "2238353521",
            phone_number: "08132198222",
            debit_type: "full",
            bank_id: "033",
            email: "elvisgideonuzuegbu@gmail.com",
            start_date: "2025-01-01",
            end_date: "2025-01-10",
            narration: "Mandate for computer loan",
            address: "69 Somewhere Street, Ebutte Metta Lagos",
            amount: 1000
        }
    });
    expect.soft(response.status()).toBe(401);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Invalid Authorization");
});


test('NEG - Verify E-mandate creation, given that certain required account credentials are missing', async ({request}) => {
    const response = await request.post(base_url+'direct-debit/mandates', {
        headers: header,
        data: {
            account_number: "2238353521",
            phone_number: "08132198222",
            debit_type: "full",
            bank_id: "033",
            email: "elvisgideonuzuegbu@gmail.com",
            // start_date: "2025-01-01",
            // end_date: "2025-01-10",
            narration: "Mandate for computer loan",
            address: "69 Somewhere Street, Ebutte Metta Lagos",
            amount: 1000
        }
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("is required");
    expect.soft(body.meta).toBeTruthy();
});


test('NEG - Verify E-mandate creation, given Invalid or incorrect account number', async ({request}) => {
    const response = await request.post(base_url+'direct-debit/mandates', {
        headers: header,
        data: {
            account_number: "1111111111",
            phone_number: "08132198222",
            debit_type: "full",
            bank_id: "033",
            email: "elvisgideonuzuegbu@gmail.com",
            start_date: "2025-01-01",
            end_date: "2025-01-10",
            narration: "Mandate for computer loan",
            address: "69 Somewhere Street, Ebutte Metta Lagos",
            amount: 1000
        }
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Mandate not created");
    expect.soft(body.meta).toBeTruthy();
});


test.afterAll('NEG - Retrieve specific mandate details, given invalid reference_number', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/mandates?reference_number=0', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not found");
    expect.soft(body.meta).toBeTruthy();
});


test.afterAll('EDGE - Retrieve all mandates created by applying out-of-range page filter', async ({request}) => {
    const response = await request.get(base_url+'direct-debit/mandates?limit=10&page=111111111', {
        headers: header
    });
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not found");
    expect.soft(body.meta).toBeTruthy();
});



