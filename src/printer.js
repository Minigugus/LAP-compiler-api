'use strict';

const { URL } = require('url');
const bodyParser = require('body-parser');
const compiler = require('lap-compiler/lib');
const lambdaWrapper = require('./lambda');
const notFound = require('./notFound');

const { LAPTokenError } = require('lap-compiler/lib/tokenizer');
const { LAPSyntaxError } = require('lap-compiler/lib/parser');

module.exports = printer => {
  const middlewares = [
    bodyParser.text({
      limit: 1 * 1024 * 1024
    }),
    lambdaWrapper(async req => {
      if (req.method !== 'POST')
        return;
      const url = new URL(req.url, 'http://example.com'); // Workaround allowing relative URLs
      const filename = (url.searchParams.get('filename') || '(input)').trim();
      const code = (typeof req.body === 'string' ? req.body : '').trim();
      if (!code)
        throw new lambdaWrapper.HTTPError(400, 'Body required', { code: 'MISSING_BODY', message: 'A body is required.' });
      try
      {
        const ast = await compiler.fromSource(code, filename);
        return new lambdaWrapper.HTTPResponse(200, 'OK', {
          filename,
          ast,
          code: printer(ast)
        });
      }
      catch (err)
      {
        console.error(err);
        if (err instanceof LAPTokenError)
          throw new lambdaWrapper.HTTPError(409, 'Compilation Error', {
            code: 'INVALID_TOKEN',
            message: err.message,
            token: err.token,
            filename: err.filename,
            position: err.position
          });
        else if (err instanceof LAPSyntaxError)
          throw new lambdaWrapper.HTTPError(409, 'Compilation Error', {
            code: 'SYNTAX_ERROR',
            message: err.message,
            token: err.token,
            filename: err.filename,
          });
        throw err;
      }
    }),
    notFound
  ];

  const next = (id, req, res) => middlewares[id](req, res, next.bind(this, id + 1, req, res));

  return next.bind(this, 0);
};
