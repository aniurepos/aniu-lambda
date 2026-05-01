# ChatQuota — Know your AWS usage

![AWS](https://img.shields.io/badge/AWS-Serverless-orange)
![Java](https://img.shields.io/badge/Java-17-blue)
![CDK](https://img.shields.io/badge/IaC-CDK-green)
![SAM](https://img.shields.io/badge/Build-SAM-yellow)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

**ChatQuota** lets you ask about your AWS account usage and service quotas in plain English. No more digging through the Console.

Built with Next.js, Ant Design, and Tauri.

This project demonstrates how to:

* Build a Java 17 Lambda using AWS SAM
* Deploy infrastructure using AWS CDK
* Expose the function through Amazon API Gateway
* Chat with the API via a **Next.js + Ant Design** client on GitHub Pages
* Package as a **macOS desktop app** with Tauri (Rust)

---

## Prerequisites

* Java 17+
* Node.js 18+
* AWS CLI
* AWS SAM CLI
* AWS CDK CLI
* Rust (for Tauri desktop build)

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
# Ensure JAVA_HOME is set (if using Homebrew on macOS)
export JAVA_HOME=/opt/homebrew/opt/openjdk@17
export PATH="$JAVA_HOME/bin:$PATH"
# Use pip-installed SAM (brew version 1.159.1 has Python 3.13 compatibility issue)
export PATH="/Users/aniu/Library/Python/3.9/bin:$PATH"

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

## CI/CD Pipeline

The project uses **GitHub Actions** for CI/CD (no CodePipeline needed).

Two independent workflows run on push to `main`:

### 1. Deploy to AWS (`.github/workflows/deploy-aws.yml`)

Triggers on changes to `sam-app/`, `sam-app-integ/`, `cdk/`, or the workflow file itself.

1. **Builds** the SAM Java Lambda (Gradle) and runs unit tests
2. **Deploys** `InfraStack-Beta` to AWS
3. **Runs** Java integration tests against the Beta API
4. **Deploys** `InfraStack-Prod` to AWS (only if integ tests pass)

This gives a **beta → test → prod** pipeline: if the integration tests fail, the workflow stops and Prod is not deployed.

### 2. Deploy to GitHub Pages (`.github/workflows/deploy-pages.yml`)

Triggers on changes to `chat-app/` or the workflow file itself.

1. **Builds** the Next.js static site
2. **Deploys** to GitHub Pages

### Stacks

| Stack | Purpose | API URL | API Key |
|-------|---------|---------|---------|
| `InfraStack-Beta` | Test environment — deployed first, verified by integ tests | Get from CDK output `ApiUrl` | Get from CDK output `ApiKeyId` |
| `InfraStack-Prod` | Production environment — deployed only after tests pass | Get from CDK output `ApiUrl` | Get from CDK output `ApiKeyId` |

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | AWS IAM access key |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key |

The IAM user needs permissions for:
- CloudFormation (deploy stacks)
- API Gateway (create/update APIs, manage API keys)
- Lambda (create/update functions)
- IAM (create roles/policies)
- S3 (CDK bootstrap bucket)

---

## Chat Client (`chat-app/`)

A single Next.js project with two pages:

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing page | Marketing site with DMG download link |
| `/chat` | Chat app | Login + chat interface for your API |

It can run as:

- **GitHub Pages** — static site in browser (landing + chat)
- **Tauri Desktop App** — native macOS app (Rust → DMG, opens directly to chat)

### Architecture

```
Landing Page (/) → Download DMG
Chat App (/chat) → API Gateway (x-api-key auth) → Lambda → AWS Usage Data
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| UI Framework | Next.js 16 (React 19) |
| Design System | [Ant Design](https://ant.design/) |
| Desktop | Tauri 2 (Rust) |
| Deployment | GitHub Actions → GitHub Pages |

### Local Development

```bash
cd chat-app

# Install dependencies
npm install --legacy-peer-deps

# Dev server (hot reload)
npm run dev

# Build static export
npm run build

# Serve locally
cd out && python3 -m http.server 8080
# Open http://localhost:8080
```

### Deploy to GitHub Pages

1. Enable GitHub Pages in repo **Settings → Pages → Source: GitHub Actions**
2. Push to `main` — the workflow in `.github/workflows/deploy-pages.yml` auto-deploys
3. Or manually trigger from **Actions → Deploy to GitHub Pages → Run workflow**

The deployed site will have:
- `https://<user>.github.io/aniu-lambda/` → Landing page
- `https://<user>.github.io/aniu-lambda/chat` → Chat app

### Build Desktop App (Tauri)

```bash
cd chat-app

# Development mode (hot reload in native window)
npm run tauri:dev

# Production build → .app + .dmg
npm run tauri:build
```

Output:
- `src-tauri/target/release/bundle/macos/ChatQuota.app`
- `src-tauri/target/release/bundle/dmg/ChatQuota_0.1.0_aarch64.dmg`

### How it works

1. **Landing Page** (`/`) — Marketing site with features, architecture diagram, and DMG download
2. **Login Screen** (`/chat`) — Enter API Gateway URL + API Key (Ant Design Card + Input)
3. **GET / health check** — Verifies the connection before entering chat
4. **Chat Interface** — Send messages via POST to API Gateway
5. **Settings panel** — Sign out or modify API credentials at any time
6. **API Gateway** validates the `x-api-key` header via Usage Plan
7. **Lambda** processes the message and returns a response

Credentials are saved to `localStorage` for convenience.

---

## Request Flow

```
Client (GitHub Pages / Tauri) → API Gateway (API Key auth) → Lambda → Response
```
