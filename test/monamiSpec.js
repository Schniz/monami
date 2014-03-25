var expect = require('chai').expect;
var should = require('chai').should();
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

    it("should extend an http server", function() {
      var httpServerKeys = Object.keys(http.createServer());
      expect(monami(Mongoose)).to.include.keys(httpServerKeys);
    });

    it("should have a `reopen` method", function() {
      expect(monami(Mongoose)).to.respondTo("reopen");
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

  describe("http server", function() {
    var app;
    var port = 8080;
    var hostname = "localhost";
    var testServer = hostname + ":" + port;

    before(function(done) {
      app = monami(Mongoose).listen(port, function(err, result) {
        if (err) {
          throw Error(err);
        } else {
          done();
        }
      });
    });

    after(function(done) {
      app.close();
      done();
    });

    it("should return 404 when a model does not exist", function(done) {
      http.get("http://" + testServer + "/this_model_does_not_exist", function(res) {
        res.statusCode.should.equal(404);
        done();
      });
    });

    describe("using Test model", function() {
      var testObjects;

      // Fetch the data
      before(function(done) {
        Mongoose.models.Test.find(function(err, data) {
          testObjects = { tests: data };
          done();
        });
      });

      it("should print all the results, as default", function(done) {
        http.get("http://" + testServer + "/tests", function(res) {
          res.on('data', function(data) {
            var body = JSON.parse(data.toString('utf-8'));
            body.should.not.be.false;
            body.should.include.key("tests");
            body.should.deep.equal(testObjects);
            done();
          });
        });
      });
    });
  });
});