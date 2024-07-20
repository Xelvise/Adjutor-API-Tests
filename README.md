## End-to-End Functional and Performance testing on Adjutor API Services


### Introduction
This repository contains test scripts for both UI and API testing of Adjutor API services.

### How to execute tests locally
- Clone the repository
- Navigate to the root directory of the project
- First, Run the following command to install the required project dependencies
```bash
npm install
```
- Run the following command to execute Functional test involving User onboarding, login and API key retrieval **in headless mode**
```bash
npm run ui-test-headless
```
- Run the following command to execute Functional test involving User onboarding, login and API key retrieval **in headed mode**
```bash
npm run ui-test
```
- Run the following command to execute API test on external API modules - such as, Verification, Decisioning, Direct debit and credit bureaus
```bash
npm run api-test-get
```








- See performance report on load test on endpoints requiring GET requests [here](https://rawcdn.githack.com/Xelvise/Adjutor-API-Tests/0ef680c4c21ee497cd65bcd423baba55758ba8bc/performance-report/Adjutor%20Load%20test%20on%20GET%20requests.html)


- See performance report on load test on endpoints requiring POST requests [here](https://rawcdn.githack.com/Xelvise/Adjutor-API-Tests/0ef680c4c21ee497cd65bcd423baba55758ba8bc/performance-report/Adjutor%20load%20test%20on%20POST%20request.html)
