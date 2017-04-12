# superagent-aws-signed-request

[![Greenkeeper badge](https://badges.greenkeeper.io/bdgamble/superagent-aws-signed-request.svg)](https://greenkeeper.io/)

Superagent plugin that intercepts and signs the request with [AWS Signature V4](http://docs.aws.amazon.com/general/latest/gr/signature-version-4.html)

# Usage

## Params
- **service** - { String, required } a string specifying the AWS service you wish to make a request to. [Supported Services](#supported-aws-services).
- **options** - { Object, optional } config object that contains optional params that have defaults
  - **key** - { String } override for default of AWS_ACCESS_KEY_ID environment variable
  - **secret** - { String } override for default of AWS_SECRET_ACCESS_KEY environment variable
  - **region** - { String } override for default of AWS_REGION environment variable
  - **sessionToken** - { String } required if you are using temporary credentials from [AWS STS](http://docs.aws.amazon.com/STS/latest/APIReference/Welcome.html)

## Supported Aws Services

  To find the appropriate service name to use, a helpful resource is the [Amazon Resource Names (ARNs) and AWS Service Namespaces page](http://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html).

  **Note:** Some services like API Gateway while having a namespace of `apigateway`, actually require you to pass `execute-api` if you are trying to make a request to the api hosted there. If you choose the wrong service name, an error should be returned with the service name you need, based on the service you are making a request to.

## Example

```javascript
const request = require('superagent');
const signRequest = require('superagent-aws-signed-request');

const awsService = 'execute-api'; // using api gateway as an example, look above for other services you can make requests to
return request
  .get(/* aws endpoint you wish to make a request to */)
  .use(signRequest(service, {
    key: 'AWS_ACCESS_KEY_ID', // uses env var by default
    secret: 'AWS_SECRET_ACCESS_KEY', // uses env var by default
    region: 'AWS_REGION', // uses env var by default
    sessionToken: 'sessionToken', // is needed if you are using temporary credentials from Amazon STS service
  }))
  .then( resp => console.log(resp));
```

# Install

It's available on [npm](https://npmjs.org) so you can simply install it with:

```
npm install --save superagent-aws-signed-request
```
