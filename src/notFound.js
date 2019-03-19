'use strict';

const wrapper = require('./lambda');

const NOT_FOUND_ERROR = new wrapper.HTTPError(404, 'Not Found', {
  code: 'NOT_FOUND',
  message: 'Route not found.'
});

module.exports = wrapper(() => { throw NOT_FOUND_ERROR; });
module.exports.NOT_FOUND_ERROR = NOT_FOUND_ERROR;