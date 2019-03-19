'use strict';

const wrapper = require('./printer');
const printer = require('lap-compiler/lib/printer/c_printer');

module.exports = wrapper(printer);