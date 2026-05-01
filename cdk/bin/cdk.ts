#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { InfraStack } from '../lib/infra-stack';

const app = new cdk.App();

const env = { account: process.env.CDK_DEFAULT_ACCOUNT || '474550261387', region: process.env.CDK_DEFAULT_REGION || 'us-west-2' };

// Deploy with: npx cdk deploy InfraStack-Beta
new InfraStack(app, 'InfraStack-Beta', { env, stage: 'Beta' });

// Deploy with: npx cdk deploy InfraStack-Prod
new InfraStack(app, 'InfraStack-Prod', { env, stage: 'Prod' });
