var expect = require('chai').expect;
var monami = require('../lib/monami');
var http = require('http');
var Mongoose = require('mongoose');

describe("Monami", function() {
  before(function() {
    Mongoose.connect("mongodb://localhost/monami_spec_tests");
    require('./models')(Mongoose);
  });

  describe("Simple creation method", function() {
    it("should be a function", function() {
      expect(monami).to.be.a("function");
    });

    it("should get an optional object of configuration, or just the Mongoose", function() {
      expect(function() {
        monami(Mongoose);
      }).to.not.throw(Error);
      expect(function() {
        monami({
          mongoose: Mongoose
        });
      }).to.not.throw(Error);
      expect(function() {
        monami();
      }).to.throw(Error);
      expect(function() {
        monami([]);
      }).to.throw(Error);
      expect(function() {
        monami({});
      }).to.throw(Error);
    });

    it("should return an http server", function() {
      var httpServerKeys = Object.keys(http.createServer());
      expect(monami(Mongoose)).to.include.keys(httpServerKeys);
    });

    it("should have a `reopen` method", function() {
      expect(monami(Mongoose)).to.respondTo("reopen");
    });

    it("should create a `get` path for /tests for model Test", function() {
    });
  });

  describe("#reopen", function() {
    var apiServer;

    beforeEach(function() {
      apiServer = monami(Mongoose);
    });

    it("should get an optional string and an configuration object", function() {
      expect(function() {
        apiServer.reopen('Test', {});
      }).to.not.throw(Error);

      expect(function() {
        apiServer.reopen({});
      }).to.not.throw(Error);
    });

    it("should raise an error if the model doesn't exist", function() {
      expect(function() {
        apiServer.reopen('ThisModelDoesntExist', {});
      }).to.throw(Error);
    });
  });
});