use aws cli
1. `aws configure`

use sam cli
1. `java --version`
1. `sam init -r java17`

sam-app
1. `sam build && sam local invoke HelloWorldFunction --event events/event.json`

cdk
1. `mkdir cdk && cp cdk && cdk init app --language typescript`
1. `npm run build`
1. `npm run cdk deploy InfraStack`