import {test, expect} from '@playwright/test';
const base_url = 'https://adjutor.lendsqr.com/v2/';
const header = {
    'Authorization': 'Bearer sk_live_178Bp1Z1KqJEynNVMDOZuYuBjj3EifRxKxWo9dii',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}
const xheader = {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
};


test('POS - Decision Models lookup', async({request}) => {
    const response = await request.get(base_url+'decisioning/models', {
        headers: header
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.meta).toBeTruthy();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");    
});

test('POS - Decision Models lookup (without authorization header)', async({request}) => {
    const response = await request.get(base_url+'decisioning/models', {
        headers: xheader
    });
    expect.soft(response).toBeOK();
    const body = await response.json();
    expect.soft(body.status).toContain("success");
    expect.soft(body.message).toContain("Successful");    
});

test('NEG - Fetch details of specific Decision model not configured on platform', async({request}) => {
    const response = await request.get(base_url+'decisioning/models/20/settings', {
        headers: header
    });
    expect.soft(response.status()).toBe(400);
    const body = await response.json();
    expect.soft(body.meta).toBeTruthy();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("Decision model not found");  
});


test('NEG - Oraculi Borrower Scoring check using model ID that\'s not been configured on platform', async({request}) => {
    const response = await request.post(base_url+'decisioning/models/2355', {
        headers: header,
        data: {
            "gender": "Male",
            "marital_status": "Single",
            "age": "21 - 30",
            "location": "lagos",
            "no_of_dependent": "3",
            "type_of_residence": "Rented Apartment",
            "educational_attainment": "Diploma/School Cert",
            "employment_status": "Unemployed",
            "sector_of_employment": "Other Financial",
            "tier": "Tier 1",
            "monthly_net_income": "100,000 - 199,999",
            "employer_category": "Private Company",
            "bvn": "22233312345",
            "phone_number": "08012345678",
            "total_years_of_experience": 5,
            "time_with_current_employer": 2,
            "previous_lendsqr_loans": 3,
            "code": "9dppknauu",
            "phone": "08012345678",
            "bvn_phone": "08012345678",
            "office_email": "elvisgideonuzuegbu@gmail.com",
            "personal_email": "elvisgideonuzuegbu@gmail.com",
            "amount": 10000
        }
    })
    expect.soft(response.status()).toBe(404);
    const body = await response.json();
    expect.soft(body.meta).toBeTruthy();
    expect.soft(body.status).toContain("error");
    expect.soft(body.message).toContain("not found");     
});
