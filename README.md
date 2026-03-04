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
