var http = require('http');
var express = require('express');
var _ = require('underscore');

module.exports = function() {
  if (arguments.length === 0) {
    throw Error("Please send in the global Mongoose variable or a configuration object.");
  } else if (arguments[0] instanceof Array) {
    throw Error("Have you meant to send in a configuration OBJECT? Please send in the global Mongoose variable or a configuration object.")
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

  // Check if there is no mongoose
  if (!defaultConfiguration.mongoose) {
    throw Error("Please send in the global Mongoose variable or configuration object.");
  }

  var app = express();
  var server = http.createServer(app);
  var Mongoose = defaultConfiguration.mongoose;

  var serverMethods = (function(Mongoose) {
    var models = Object.keys(Mongoose.models);
    var defaultServerMethods = {
      index: function(req, res, next) {},
      show: function(req, res, next) {},
      destroy: function(req, res, next) {},
      update: function(req, res, next) {},
      insert: function(req, res, next) {}
    }
    var serverMethods = {
      null: defaultServerMethods
    };

    models.forEach(function(model) {
      serverMethods[model] = {
        index: function() { defaultServerMethods.index.call(this, arguments) },
        show: function() { defaultServerMethods.show.call(this, arguments) },
        destroy: function() { defaultServerMethods.destroy.call(this, arguments) },
        update: function() { defaultServerMethods.update.call(this, arguments) },
        insert: function() { defaultServerMethods.insert.call(this, arguments) }
      }
    });
  })(Mongoose);

  app.get("/:modelName")

  var reopenModel = function(model, overrides) {
    if (!_(Mongoose.models).has(model)) {
      throw Error("Model " + model + " does not exist");
    }

    _(serverMethods[model]).extend(overrides);
  };

  var reopenAll = function(overrides) {
  };

  server.reopen = function() {
    if (typeof(arguments[0]) === 'string') {
      return reopenModel(arguments[0], arguments[1] || {});
    } else {
      return reopenAll(arguments[0] || {});
    }
  };

  return server;
};