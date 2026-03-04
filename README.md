# Java Serverless API on AWS (SAM + CDK)

![AWS](https://img.shields.io/badge/AWS-Serverless-orange)
![Java](https://img.shields.io/badge/Java-17-blue)
![CDK](https://img.shields.io/badge/IaC-CDK-green)
![SAM](https://img.shields.io/badge/Build-SAM-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

This project demonstrates how to:

* Build a Java 17 Lambda using AWS SAM
* Deploy infrastructure using AWS CDK
* Expose the function through Amazon API Gateway

![](https://private-user-images.githubusercontent.com/265409182/557850167-61d786b9-019a-4800-8796-92371add4408.png?jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJnaXRodWIuY29tIiwiYXVkIjoicmF3LmdpdGh1YnVzZXJjb250ZW50LmNvbSIsImtleSI6ImtleTUiLCJleHAiOjE3NzI1OTMwNTEsIm5iZiI6MTc3MjU5Mjc1MSwicGF0aCI6Ii8yNjU0MDkxODIvNTU3ODUwMTY3LTYxZDc4NmI5LTAxOWEtNDgwMC04Nzk2LTkyMzcxYWRkNDQwOC5wbmc_WC1BbXotQWxnb3JpdGhtPUFXUzQtSE1BQy1TSEEyNTYmWC1BbXotQ3JlZGVudGlhbD1BS0lBVkNPRFlMU0E1M1BRSzRaQSUyRjIwMjYwMzA0JTJGdXMtZWFzdC0xJTJGczMlMkZhd3M0X3JlcXVlc3QmWC1BbXotRGF0ZT0yMDI2MDMwNFQwMjUyMzFaJlgtQW16LUV4cGlyZXM9MzAwJlgtQW16LVNpZ25hdHVyZT05MzAyMWVlYmE3ZjMwNjc2NWNhNWQ1NGQ0YzIxYzNhMGFhODBjMDQxZWExYjM1NTBiMDI4ZWU4MWE5Mjc5MWUxJlgtQW16LVNpZ25lZEhlYWRlcnM9aG9zdCJ9.bkhpRkUzy6Ja6xHROSI92bltOCM1eYBYq8aHemSJ0nU)

---

## Prerequisites

* Java 17+
* Node.js 18+
* AWS CLI
* AWS SAM CLI
* AWS CDK CLI

---

## Configure AWS

```bash
aws configure
```

---

## Initialize Lambda (SAM)

Verify Java:

```bash
java --version
```

Create the SAM project:

```bash
sam init -r java17
```

---

## Build and Test Lambda

Inside `sam-app`:

```bash
sam build && sam local invoke HelloWorldFunction --event events/event.json
```

---

## Deploy Infrastructure (CDK)

Create CDK app:

```bash
mkdir cdk
cd cdk
cdk init app --language typescript
```

Build:

```bash
npm run build
```

Deploy:

```bash
npm run cdk deploy InfraStack
```

---

## Request Flow

Client → API Gateway → Lambda → Dependency Service → Response
