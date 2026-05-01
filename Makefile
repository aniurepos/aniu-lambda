# =============================================================================
# aniu-lambda Makefile
# =============================================================================
# Common commands for building, deploying, and testing.
#
# Prerequisites:
#   - Java 17 (OpenJDK): brew install openjdk@17
#   - Node.js + npm
#   - AWS CLI v1 (Python): pip3 install awscli
#   - CDK: npm install -g aws-cdk
#   - Rust (for Tauri): curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
# =============================================================================

SHELL := /bin/zsh
JAVA_HOME := /opt/homebrew/opt/openjdk@17
PATH := $(JAVA_HOME)/bin:$(PATH)

# ---- AWS Credentials (via boto3 / macOS Keychain) ----
# CDK's JS SDK can't read macOS Keychain, so we export creds via boto3.
AWS_CREDS := $(shell python3 -c "import boto3; c=boto3.Session().get_credentials().get_frozen_credentials(); print(f'AWS_ACCESS_KEY_ID={c.access_key} AWS_SECRET_ACCESS_KEY={c.secret_key} AWS_SESSION_TOKEN={c.token} AWS_DEFAULT_REGION=us-west-2')")

# ---- API Gateway outputs (set after deploy) ----
# Get these from CDK stack outputs:
#   cdk deploy --outputs-file response.json
#   cat response.json | jq '.InfraStack-Beta.ApiUrl'
#   cat response.json | jq '.InfraStack-Beta.ApiKeyId'
# Beta (default for testing)
API_URL ?= <your-api-url>
API_KEY ?= <your-api-key>
# Prod (override with: make test-integ API_URL=... API_KEY=...)
PROD_API_URL ?= <your-prod-api-url>
PROD_API_KEY ?= <your-prod-api-key>

# =============================================================================
# SAM Java Lambda
# =============================================================================

.PHONY: sam-build sam-test

sam-build: ## Build the SAM Java Lambda (Gradle)
	cd sam-app/HelloWorldFunction && ./gradlew build

sam-test: ## Run SAM Java Lambda unit tests
	cd sam-app/HelloWorldFunction && ./gradlew test

# =============================================================================
# CDK Deploy
# =============================================================================

.PHONY: deploy deploy-beta deploy-prod

deploy: deploy-beta ## Deploy InfraStack-Beta (API Gateway + Lambda) to AWS

deploy-beta: ## Deploy Beta stack
	cd cdk && $(AWS_CREDS) ./node_modules/.bin/cdk deploy InfraStack-Beta --require-approval never

deploy-prod: ## Deploy Prod stack
	cd cdk && $(AWS_CREDS) ./node_modules/.bin/cdk deploy InfraStack-Prod --require-approval never

# =============================================================================
# Integration Tests
# =============================================================================

.PHONY: test-integ

test-integ: ## Run Java integration tests against deployed API
	cd sam-app-integ && ./gradlew test \
		-Dapi.url="$(API_URL)" \
		-Dapi.key="$(API_KEY)"

# =============================================================================
# Full workflow: build -> deploy beta -> test -> deploy prod
# =============================================================================

.PHONY: all

all: sam-build deploy-beta test-integ deploy-prod ## Build, deploy beta, test, deploy prod

# =============================================================================
# Chat App (Next.js + Tauri)
# =============================================================================

.PHONY: chat-dev chat-build chat-tauri-dev chat-tauri-build

chat-dev: ## Start Next.js dev server for the chat app
	cd chat-app && npm run dev

chat-build: ## Build Next.js static export
	cd chat-app && npm run build

chat-build-docs: chat-build ## Build Next.js static export and copy to docs/ (for GitHub Pages)
	rm -rf docs
	cp -r chat-app/out docs
	@echo "✅ docs/ folder updated. Commit and push to deploy to GitHub Pages."

chat-tauri-dev: ## Start Tauri dev mode (Next.js + Tauri window)
	cd chat-app && npm run tauri dev

chat-tauri-build: ## Build Tauri desktop app (DMG for macOS) and copy to versionless path
	cd chat-app && npm run tauri build
	mkdir -p chat-app/dist
	# DMG is in macos/ (dmg/ bundling may fail on some systems)
	cp chat-app/src-tauri/target/release/bundle/macos/*.dmg chat-app/dist/ChatQuota.dmg 2>/dev/null || \
		cp chat-app/src-tauri/target/release/bundle/dmg/*.dmg chat-app/dist/ChatQuota.dmg 2>/dev/null || \
		(echo "❌ No DMG found in bundle/macos/ or bundle/dmg/" && exit 1)
	@echo "✅ DMG ready at chat-app/dist/ChatQuota.dmg"
	@echo "   Commit and push a tag to upload to release."

# =============================================================================
# Utility
# =============================================================================

.PHONY: help clean

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | sort | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

clean: ## Clean build artifacts
	cd sam-app/HelloWorldFunction && ./gradlew clean
	cd sam-app-integ && ./gradlew clean
	cd cdk && rm -rf cdk.out
	cd chat-app && rm -rf out .next
