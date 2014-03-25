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
    var testServer = "http://" + hostname + ":" + port;

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
      http.get(testServer + "/this_model_does_not_exist", function(res) {
        res.statusCode.should.equal(404);
        done();
      });
    });

    describe("using Test model", function() {
      describe("DELETE: deleting model", function() {
        it("should raise 404 if the model wasn't found", function() {
          // TODO: Implement!
        });

        it("should remove one model", function() {
          // TODO: Implement!
        });
      });

      it("should return all the results, as default", function(done) {
        Mongoose.models.Test.find(function(err, mongoData) {
          http.get(testServer + "/tests", function(res) {
            res.on('data', function(data) {
              var body = JSON.parse(data.toString('utf-8'));
              body.should.not.be.false;
              body.should.include.key("tests");
              JSON.stringify(body.tests).should.deep.equal(JSON.stringify(mongoData));
              done();
            });
          });
        });
      });

      // it("should add a model to the collection", function(done) {
      //   http.put({})
      // });

      describe("SHOW", function() {
        var object;
        before(function(done) {
          object = new Mongoose.models.Test({ name: "test1", randomNumber: Math.floor(Math.random() * 100) });
          object.save(function() {
            done();
          });
        });

        it("should return a specific model", function(done) {
          http.get(testServer + "/tests/" + object._id, function(res) {
            res.on('data', function(data) {
              var body = JSON.parse(data.toString('utf-8'));
              body.should.deep.equal(object.toSimpleObject());
              done();
            });
          });
        });

        it("should raise 404 if a model does not exist", function(done) {
          http.get(testServer + "/tests/" + Mongoose.Types.ObjectId().toString(), function(res) {
            res.statusCode.should.equal(404);
            done();
          });
        });

        after(function(done) {
          object.remove(function() {
            done();
          });
        })
      });
    });
  });
});