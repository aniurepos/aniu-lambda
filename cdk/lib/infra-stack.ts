import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export interface InfraStackProps extends cdk.StackProps {
  /** Stage name: 'Beta' or 'Prod' */
  stage: string;
}

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: InfraStackProps) {
    super(scope, id, props);

    const stage = props.stage;

    const fn = new lambda.Function(this, 'HelloFn', {
      runtime: lambda.Runtime.JAVA_17,
      handler: 'helloworld.App::handleRequest',
      timeout: cdk.Duration.seconds(10),
      code: lambda.Code.fromAsset(
        '../sam-app/.aws-sam/build/HelloWorldFunction'
      ),
      functionName: `HelloFn-${stage}`,
    });

    // Create API Gateway
    // defaultCorsPreflightOptions automatically adds OPTIONS methods
    const api = new apigw.RestApi(this, 'HelloApi', {
      restApiName: `HelloApi-${stage}`,
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: ['Content-Type', 'x-api-key'],
      },
    });

    // Root method: ANY /
    api.root.addMethod('ANY', new apigw.LambdaIntegration(fn), {
      apiKeyRequired: true,
    });

    // Proxy method: ANY /{proxy+}
    const proxyResource = api.root.addResource('{proxy+}');
    proxyResource.addMethod('ANY', new apigw.LambdaIntegration(fn), {
      apiKeyRequired: true,
    });

    // Create an API Key
    const apiKey = api.addApiKey('ApiKey', {
      apiKeyName: `HelloApiKey-${stage}`,
      description: `API Key for Hello API (${stage})`,
    });

    // Create a Usage Plan and associate it with the API and API Key
    const plan = api.addUsagePlan('UsagePlan', {
      name: `HelloApiUsagePlan-${stage}`,
      description: `Usage plan for Hello API (${stage})`,
      apiStages: [
        {
          api,
          stage: api.deploymentStage,
        },
      ],
    });

    plan.addApiKey(apiKey);

    // Output the API URL
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: api.url,
      description: `API Gateway endpoint URL (${stage})`,
    });

    new cdk.CfnOutput(this, 'ApiKeyId', {
      value: apiKey.keyId,
      description: `API Key ID (${stage})`,
    });
  }
}
