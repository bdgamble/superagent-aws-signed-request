'use strict';

const aws4 = require('aws4');
const qs = require('qs');
const url = require('url');

module.exports = function awsSignedRequest(service, options) {
  if (!service || typeof service !== 'string') {
    throw new Error('The AWS service you wish to make a request to must be provided as the first parameter. View docs for list of available services.');
  }
  options = options || {};
  options.key = options.key || process.env.AWS_ACCESS_KEY_ID;
  options.secret = options.secret || process.env.AWS_SECRET_ACCESS_KEY;
  options.region = options.region || process.env.AWS_REGION;

  return function signRequest(req) {
    const end = req.end;
    req.end = function(cb) {
      let data = req.header['Content-Type'] === 'application/json'
        ? JSON.stringify(req._data)
        : req._formData;

      const headers = req.header;
      if (options.sessionToken) {
        headers['X-Amz-Security-Token'] = options.sessionToken;
      }

      const parsedUrl = url.parse(req.url, true);
      let path = parsedUrl.path;
      // superagent does not append the querystring to the path until end is called, so in order to get the correct path for signing, must append it here.
      if (Object.keys(req.qs).length) {
        const query = qs.stringify(req.qs);
        path = path + (path.indexOf('?') >= 0 ? '&' : '?') + query
      }

      const signedOptions = aws4.sign({
        host: parsedUrl.host,
        method: req.method,
        path: path,
        body: data,
        service: service,
        region: options.region,
        headers: headers
      }, {
        accessKeyId: options.key,
        secretAccessKey: options.secret,
        sessionToken: options.sessionToken
      });

      req.header = signedOptions.headers;

      req.end = end;
      req.end(cb);

      return this;
    };

    return req;
  };
};
