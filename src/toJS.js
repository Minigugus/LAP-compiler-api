'use strict';

const wrapper = require('./printer');
const printer = require('lap-compiler/lib/printer/js_printer');

module.exports = wrapper(printer);