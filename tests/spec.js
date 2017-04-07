'use strict';

const chai = require('chai'),
  chaiAsPromised = require('chai-as-promised'),
  nock = require('nock'),
  request = require('superagent');

chai.use(chaiAsPromised);
const expect = chai.expect;

const signRequest = require('../');

describe('superagent-aws-signed-request', () => {

  describe('validates params', () => {
    it('ensures service is passed', () => {
      return expect(() => request
        .get('/')
        .use(signRequest())
      ).to.throw(Error, /The AWS service you wish to make a request to must be provided as the first parameter/);
    });
  });

  const service = 'execute-api';
  describe('signs the GET request', () => {
    let req;
    beforeEach(done => {
      req = nock('http://localhost', {
        reqheaders: {
          Authorization: /AWS4-HMAC-SHA256 Credential=.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i,
          'X-Amz-Date': /.*/i
        }
      })
      .get('/')
      .reply(200);

      done();
    });

    afterEach(done => {
      req.done();
      done();
    });

    it('with default values', () => {
      return request
        .get('/')
        .use(signRequest(service))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.request.header)
            .to.have.property('Authorization');
          expect(resp.request.header['Authorization'])
            .to.match(/AWS4-HMAC-SHA256 Credential=.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i);
        });
    });

    it('with provided values', () => {
      return request
        .get('/')
        .use(signRequest(service, { key: 'a', secret: 'b'}))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.request.header)
            .to.have.property('Authorization');
          expect(resp.request.header['Authorization'])
            .to.match(/AWS4-HMAC-SHA256 Credential=a.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i);
        });
    });

    it('with provided values and adds sessionToken header', () => {
      return request
        .get('/')
        .use(signRequest(service, { key: 'a', secret: 'b', sessionToken: 'c'}))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.request.header)
            .to.have.property('Authorization');
          expect(resp.request.header['Authorization'])
            .to.match(/AWS4-HMAC-SHA256 Credential=a.*\/execute-api\/aws4_request, SignedHeaders=.*x-amz-security-token, Signature=.*/i);
          expect(resp.request.header)
            .to.have.property('X-Amz-Security-Token');
          expect(resp.request.header['X-Amz-Security-Token'])
            .to.equal('c');
        });
    });
  });

  describe('signs GET with querysting', () => {
    it('and signs querystring', () => {
      const query = nock('http://localhost', {
        reqheaders: {
          Authorization: /AWS4-HMAC-SHA256 Credential=.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i,
          'X-Amz-Date': /.*/i
        }
      })
      .get('/?query=blah')
      .reply(200);

      return request
        .get('/?query=blah')
        .use(signRequest(service))
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.request.header)
            .to.have.property('Authorization');
          expect(resp.request.header['Authorization'])
            .to.match(/AWS4-HMAC-SHA256 Credential=.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i);
            query.done();
        });
    });
  })

  describe('signs the POST request', () => {
    let req;
    const testPostData = {json: 'data'};
    beforeEach(done => {
      req = nock('http://localhost', {
        reqheaders: {
          Authorization: /AWS4-HMAC-SHA256 Credential=.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i,
          'X-Amz-Date': /.*/i
        }
      })
      .post('/', testPostData)
      .reply(200);

      done();
    });

    afterEach(done => {
      req.done();
      done();
    });

    it('with default values', () => {
      return request
        .post('/')
        .use(signRequest(service))
        .send(testPostData)
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.request.header)
            .to.have.property('Authorization');
          expect(resp.request.header['Authorization'])
            .to.match(/AWS4-HMAC-SHA256 Credential=.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i);
        });
    });

    it('with provided values', () => {
      return request
        .post('/')
        .use(signRequest(service, { key: 'a', secret: 'b'}))
        .send(testPostData)
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.request.header)
            .to.have.property('Authorization');
          expect(resp.request.header['Authorization'])
            .to.match(/AWS4-HMAC-SHA256 Credential=a.*\/execute-api\/aws4_request, SignedHeaders=.*Signature=.*/i);
        });
    });

    it('with provided values and adds sessionToken header', () => {
      return request
        .post('/')
        .use(signRequest(service, { key: 'a', secret: 'b', sessionToken: 'c'}))
        .send(testPostData)
        .then(resp => {
          expect(resp.status).to.equal(200);
          expect(resp.request.header)
            .to.have.property('Authorization');
          expect(resp.request.header['Authorization'])
            .to.match(/AWS4-HMAC-SHA256 Credential=a.*\/execute-api\/aws4_request, SignedHeaders=.*x-amz-security-token, Signature=.*/i);
          expect(resp.request.header)
            .to.have.property('X-Amz-Security-Token');
          expect(resp.request.header['X-Amz-Security-Token'])
            .to.equal('c');
        });
    });
  });
});
