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
- Run the following command to execute end-to-end test on entire API services and UI
```bash
npm run regression
```






- (Here's a breakdown of passed and failed test cases, as at when run)

- See performance report on load and stress test on endpoints requiring GET requests [here](https://rawcdn.githack.com/Xelvise/Adjutor-API-Tests/db1652384f08cf4e6e4cfa2cec0e641971a377b0/performance-report/GET%20ramp-up%20test%20on%20Adjutor%20API.html)


- See performance report on load and stress test on endpoints requiring POST requests [here](https://rawcdn.githack.com/Xelvise/Adjutor-API-Tests/db1652384f08cf4e6e4cfa2cec0e641971a377b0/performance-report/POST%20ramp-up%20test%20on%20Adjutor%20API.html)

