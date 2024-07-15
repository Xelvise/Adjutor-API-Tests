import {test, expect} from '@playwright/test';
const base_url = 'https://adjutor.lendsqr.com/v2/';
const header = {
    'Authorization': 'Bearer sk_live_178Bp1Z1KqJEynNVMDOZuYuBjj3EifRxKxWo9dii',
    'Content-Type': 'application/json',
    'Accept': 'application/json'
}


test('NEG - Exchange code authorization using invalid code', async({request}) => {
    const response = await request.get(base_url+'kolo/auth', {
        headers: header,
        data: {
            "redirect_uri": "https://belhope.lsq.app",
            "grant_type": "authorization_code",
            "code": "kEhA1fQsT86ZxCqh"
        }
    });
    expect(response.status()).toBe(403);
    const body = await response.json();
    expect(body.status).toContain("error");
    expect(body.message).toContain("not authorized");
});