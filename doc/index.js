/* eslint linebreak-style: ["error", "windows"]*/
'use strict'

const http = require('http')

const ecstatic = require('ecstatic')({
  root: `${__dirname}`,
  showDir: false,
  autoIndex: true,
  defaultExt: 'html',
  contentType: 'text/html',
  cors: true,
});

http.createServer(ecstatic).listen(8080);
