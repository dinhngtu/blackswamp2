'use strict';

const tjs = require("typescript-json-schema");

tjs.exec(process.argv[2], process.argv[3], {
  out: process.argv[4]
});
