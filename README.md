# End-to-End Functional and Performance testing on Adjutor API Services


## Introduction
This repository contains test scripts for both UI and API testing of Adjutor API services.

## Local Installation and Setup
- Execute the following command to clone the repository
```bash
git clone https://github.com/Xelvise/Adjutor-API-Tests.git
```
- Next, navigate to the root directory of the project from which you should install the required dependencies by running the following command
```bash
npm install
```

#### Prior to executing test scripts, it is required that all environment variables be provided in `.env` file located in the root directory of the cloned project. Otherwise, all tests are bound to fail. 
Follow these steps:
- Create a free account with [MailSlurp](https://app.mailslurp.com/sign-up/) and obtain an API key. This is required for email generation verification during user onboarding.
- Create a free account with [Adjutor](https://app.adjutor.io/signup). Create an app, select all web services and copy API key. This is required for Authorization in API response testing and Performance testing.
- Add in valid banking credentials - such as BVN, Account number, Bank code, etc. This is required for most test cases


## Execute Test Suite
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
npm run api-test
```
- Run the following command to execute end-to-end test on entire API services (including Signup and Login functionalities)
```bash
npm run regression
```






- [Here's a breakdown of passed and failed test cases, as at last run](https://rawcdn.githack.com/Xelvise/Adjutor-API-Tests/599537df192abc0434593ff88b5520c3ce371634/performance-report/Playwright%20test%20result.html)

- See performance report on load and stress test run on GET endpoints [here](https://rawcdn.githack.com/Xelvise/Adjutor-API-Tests/db1652384f08cf4e6e4cfa2cec0e641971a377b0/performance-report/GET%20ramp-up%20test%20on%20Adjutor%20API.html)


- See performance report on load and stress test on POST endpoints [here](https://rawcdn.githack.com/Xelvise/Adjutor-API-Tests/db1652384f08cf4e6e4cfa2cec0e641971a377b0/performance-report/POST%20ramp-up%20test%20on%20Adjutor%20API.html)

