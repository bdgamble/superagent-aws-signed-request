'use strict';

const aws = require('aws-sdk');
const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const fs = require('fs');
const path = require('path');
const request = require('superagent');

chai.use(chaiAsPromised);
const expect = chai.expect;

const sts = new aws.STS();

const signRequest = require('../../');

describe('integration test with Api Gateway', () => {
  let assumedRole;
  let serviceEndpoint;
  before(done => {
    const envVarFileName = `.${process.env.AWS_REGION}_dev_test`;
    const envVarFile = path.join(__dirname, '..', 'infra', 'resources', envVarFileName);
    fs.readFile(envVarFile, 'utf-8', (err, data) => {
      if (err) {
        done(err);
        return;
      }
      const values = {};
      data.split('\n').forEach( envvar => {
        const splitVar = envvar.split('=');
        values[splitVar[0]] = splitVar[1];
      });
      serviceEndpoint = `https://${values.CF_ApiGatewayRestApi}.execute-api.${process.env.AWS_REGION}.amazonaws.com/dev/test`;

      sts.getCallerIdentity().promise()
        .then(caller => {
          const roleArn = `arn:aws:iam::${caller.Account}:role/${values.CF_ExecuteApiIAMRole}`;
          return sts.assumeRole({
            RoleArn: roleArn,
            ExternalId: aws.config.credentials.accessKeyId,
            RoleSessionName: 'TestingSuperagentAwsSignedRequest'
          }).promise()
          .then(role => {
            assumedRole = role;
            done()
          }, done);
        });
    });
  });

  it('makes a request to apigateway', () => {
    return request
      .get(serviceEndpoint)
      .use(signRequest('execute-api', {
        key: assumedRole.Credentials.AccessKeyId,
        secret: assumedRole.Credentials.SecretAccessKey,
        sessionToken: assumedRole.Credentials.SessionToken
       }))
       .then( response => {
         expect(response.statusCode).to.equal(200);
       });
  });
});
