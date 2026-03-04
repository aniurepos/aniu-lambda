import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigw from 'aws-cdk-lib/aws-apigateway';

export class InfraStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const fn = new lambda.Function(this, 'HelloFn', {
      runtime: lambda.Runtime.JAVA_17,
      handler: 'helloworld.App::handleRequest',
      timeout: cdk.Duration.seconds(10),
      code: lambda.Code.fromAsset(
        '../sam-app/.aws-sam/build/HelloWorldFunction'
      ),
    });

    const api = new apigw.LambdaRestApi(this, 'HelloApi', {
      handler: fn,
      proxy: true,
    });
  }
}