# Project Guide for Claude AI

This document provides essential context for the AI agent (Claude) to understand and interact with this project.

## 1. Project Overview

*   **Name:** Website-Checker
*   **Description:** The purpose of this project is to maintain a json list of websites that the fuction proceses and checks for a 200 status response on each site. If a site does not return a 200 status send an alert through AWS SES smtp gateway.
*   **Goal:** The goal is to maintain and deploy a website-checker lambda function and websites.json file that will be deployed to check websites on a schedule.

## 2. Technology Stack

*   **Runtime:** Node.js 23.x (AWS Lambda Managed Runtime)
*   **Cloud Provider:** AWS (Amazon Web Services)
*   **Core Services:**
    *   AWS Lambda
    *   Amazon CloudWatch (for logging and monitoring)
*   **Libraries/Frameworks:**
    *   serverless' (framework for deployment)
*   **AWS SDK Version:** AWS SDK for JavaScript v3 is mandatory for modularity and performance.
*   **Package Manager:** npm

## 3. Project Structure

*   `/src`: Contains all source code for the Lambda function.
    *   `/src/handlers`: Contains specific event handlers (e.g., `sesProcessor.js`).
    *   `/src/utils`: Contains shared utility functions (e.g., `sesUtils.js`).
*   `/tests`: Contains all unit and integration tests.
*   `package.json`: Project dependencies and scripts.
*   `serverless.yml`: Infrastructure as Code (IaC) configuration file.

## 4. Development Guidelines & Best Practices

*   **Code Style:** Adhere to standard JavaScript/Node.js best practices (e.g., use `const` and `let` over `var`, use arrow functions).
*   **AWS Lambda Best Practices:**
    *   **Reuse Execution Context:** Initialize SDK clients and database connections outside the main handler function for "warm start" performance.
    *   **Environment Variables:** Use environment variables for operational parameters like S3 bucket names or API endpoints.
    *   **Modularity:** Only import specific clients from AWS SDK v3 (e.g., `import { SESClient } from '@aws-sdk/client-ses'`) to reduce deployment package size.
    *   **Error Handling:** Implement robust error handling and use structured logging for CloudWatch.
*   **Testing:** New features or bug fixes must be accompanied by relevant unit tests in the `/tests` directory.
*   **Tool Usage:**
    *   Use `npm install` for dependency management.
    *   Use `npm test` to run all tests.

## 5. Specific Instructions for Claude

*   Prioritize modular, performant code suitable for a serverless environment.
*   Always propose a plan (design document) before making significant code changes.
*   If integrating with Anthropic models, use the AWS SDK v3 for Amazon Bedrock and ensure all necessary IAM permissions are considered.
*   Maintain this `CLAUDE.md` file to reflect any architectural changes.
