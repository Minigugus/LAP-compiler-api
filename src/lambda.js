class HTTPResponse {
  constructor(code, message, data) {
    this.code = code;
    this.message = message;
    this.data = data;
  }

  toJSON() {
    return this.data;
  }
};
class HTTPError extends Error {
  constructor(code, message, data) {
    super(message);
    this.code = code;
    this.data = data;
  }

  toJSON() {
    return this.data;
  } 
};

const respond = (res, code, message, body) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // TODO : Improve this...
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = code;
  res.statusMessage = message;
  if (body)
    res.write(JSON.stringify(body));
  res.end();
};

module.exports = (fn) => async (req, res, next) => {
  try
  {
    let result = fn instanceof Function ? await fn(req, res) : fn;
    if (!result)
      return next && next();
    else
    {
      if (typeof result === 'boolean')
        result = new HTTPResponse(204, 'No Content');
      else if (!(result instanceof HTTPResponse))
        result = new HTTPResponse(200, 'OK', result);
      respond(res, result.code, result.message, { data: result.toJSON() });
    }
  }
  catch (err)
  {
    if (!(err instanceof HTTPError))
      err = new HTTPError(500, 'Internal Server Error', { internal: err.message });
    respond(res, err.code, err.message, { error: err.toJSON() });
  }
}
module.exports.HTTPResponse = HTTPResponse;
module.exports.HTTPError = HTTPError;