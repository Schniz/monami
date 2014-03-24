var http = require('http');
var express = require('express');
var _ = require('underscore');
var path = require('path');


module.exports = function() {
  if (arguments.length === 0) {
    throw Error("Please send in the global Mongoose variable or a configuration object.");
  } else if (arguments[0] instanceof Array) {
    throw Error("Have you meant to send in a configuration OBJECT? Please send in the global Mongoose variable or a configuration object.")
  }

  var requireRelative = function(file) {
    var absolutePath = path.resolve(__dirname, file).toString();
    return require(absolutePath);
  }

  var defaultConfiguration = {
    mongoose: null,
    hamin: 'haminados'
  };

  // Default configs
  if (typeof(arguments[0].Mongoose) === 'function') {
    defaultConfiguration.mongoose = arguments[0];
  } else {
    _(defaultConfiguration).extend(arguments[0]);
  }

  _(defaultConfiguration).extend({
    '_': _,
    'Mongoose': defaultConfiguration.mongoose,
    'requireRelative': requireRelative
  });

  // Check if there is no mongoose
  if (!defaultConfiguration.mongoose) {
    throw Error("Please send in the global Mongoose variable or configuration object.");
  }

  var app = defaultConfiguration.app = express();
  var Mongoose = defaultConfiguration.Mongoose;
  var serverMethods = defaultConfiguration.serverMethods = requireRelative('monami/server-methods')(defaultConfiguration);
  var createRoutes = defaultConfiguration.createRoutes = requireRelative('monami/route-creator')(defaultConfiguration);

  var reopenModel = requireRelative('monami/reopen-model')(defaultConfiguration);

  var reopenAll = function(overrides) {
  };

  var server = http.createServer(app);
  server.reopen = function() {
    if (typeof(arguments[0]) === 'string') {
      return reopenModel(arguments[0], arguments[1] || {});
    } else {
      return reopenAll(arguments[0] || {});
    }
  };

  return server;
};