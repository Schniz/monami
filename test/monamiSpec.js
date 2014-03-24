var expect = require('chai').expect;
var monami = require('../lib/monami');
var http = require('http');
var Mongoose = require('mongoose');

describe("Monami", function() {
  describe("Simple creation method", function() {
    it("should be a function", function() {
      expect(monami).to.be.a("function");
    });

    it("should get an optional object of configuration", function() {
      expect(function() {
        monami();
      }).to.not.throw(Error);
      expect(function() {
        monami({});
      }).to.not.throw(Error);
    });

    it("should return an http server", function() {
      var httpServerKeys = Object.keys(http.createServer());
      expect(monami()).to.include.keys(httpServerKeys);
    });
  });
});