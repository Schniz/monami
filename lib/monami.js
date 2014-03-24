var http = require('http');
var express = require('express');

module.exports = function() {
  var app = express();
  var server = http.createServer(app);

  return server;
};