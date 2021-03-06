var expect = require('chai').expect;
var should = require('chai').should();
var monami = require('../lib/monami');
var http = require('http');
var Mongoose = require('mongoose');
var request = require('request');
var express = require('express');

var generateRandomNumber = function(number) {
  return Math.floor(Math.random() * number);
};

describe("Monami", function() {
  var TestModel;

  before(function() {
    Mongoose.connect("mongodb://localhost/monami_spec_tests");
    require('./models')(Mongoose);

    TestModel = Mongoose.models.Test;
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

    it("should be an express instance", function() {
      var httpServerKeys = Object.keys(express());
      expect(monami(Mongoose)).to.include.keys(httpServerKeys);
    });

    it("should be able to be mounted by express", function() {
      expect(function() {
        var expressApp = express();
        express.use('/api', monami(Mongoose));
      }).to.not.throw(Error);
    });

    it("should have a `reopen` method", function() {
      monami(Mongoose).reopen.should.be.a("function");
    });
  });

  describe("#reopen", function() {
    var app;
    var port = 8080;
    var hostname = "localhost";
    var testServer = "http://" + hostname + ":" + port;

    before(function() {
      app = monami(Mongoose);
    });

    it("should get an optional string and an configuration object", function() {
      expect(function() {
        app.reopen('Test', {});
      }).to.not.throw(Error);

      expect(function() {
        app.reopen({});
      }).to.not.throw(Error);
    });

    it("should raise an error if the model doesn't exist", function() {
      expect(function() {
        app.reopen('ThisModelDoesntExist', {});
      }).to.throw(Error);
    });

    describe("should replace the default methods of the app", function() {
      var appInstance;

      before(function(done) {
        appInstance = app.listen(8080, function(err, result) {
          if (err) {
            throw Error(err);
          } else {
            done();
          }
        });
      });

      after(function(done) {
        appInstance.close(function() {
          done();
        });
      });

      it("should return 'simple index' for index method", function(done) {
        app.reopen({
          index: function(req, res) { return res.status(200).send('simple index'); }
        });

        request.get(testServer + "/tests", function(error, res, body) {
          res.statusCode.should.equal(200);
          res.body.should.equal('simple index');
          done();
        });
      });

      it("should return 'simple destroy' for destroy method", function(done) {
        app.reopen({
          destroy: function(req, res) { return res.status(200).send('simple destroy'); }
        });

        request.del(testServer + "/tests/123", function(error, res, body) {
          res.statusCode.should.equal(200);
          res.body.should.equal('simple destroy');
          done();
        });
      });

      it("should return 'simple show' for show method", function(done) {
        app.reopen({
          show: function(req, res) { return res.status(200).send('simple show'); }
        });

        request.get(testServer + "/tests/123", function(error, res, body) {
          res.statusCode.should.equal(200);
          res.body.should.equal('simple show');
          done();
        });
      });

      it("should return 'simple update' for update method", function(done) {
        app.reopen({
          update: function(req, res) { return res.status(200).send('simple update'); }
        });

        request.post(testServer + "/tests/123", function(error, res, body) {
          res.statusCode.should.equal(200);
          res.body.should.equal('simple update');
          done();
        });
      });

      it("should return 'simple insert' for insert method", function(done) {
        app.reopen({
          insert: function(req, res) { return res.status(200).send('simple insert'); }
        });

        request.put(testServer + "/tests", function(error, res, body) {
          res.statusCode.should.equal(200);
          res.body.should.equal('simple insert');
          done();
        });
      });
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
      app.close(function() {
        done();
      });
    });

    it("should return 404 when a model does not exist", function(done) {
      request.get(testServer + "/this_model_does_not_exist", function(err, res) {
        res.statusCode.should.equal(404);
        done();
      });
    });

    describe("using Test model", function() {
      describe("INDEX: showing all models", function() {
        it("should return all the results, as default", function(done) {
          TestModel.find(function(err, mongoData) {
            request.get(testServer + "/tests", function(err, res, body) {
              var jsonBody = JSON.parse(body);
              jsonBody.should.not.equal(false);
              jsonBody.should.include.key("tests");
              JSON.stringify(jsonBody.tests).should.deep.equal(JSON.stringify(mongoData));
              done();
            });
          });
        });

        // it("should accept querystring parameters for searching", function() {
        //   "unimplemented".should.not.equal("unimplemented");
        // });

        // it("should accept querystring for paging", function() {
        //   "unimplemented".should.not.equal("unimplemented");
        // });
      });

      describe("DELETE: deleting model", function() {
        var object;
        before(function(done) {
          object = new TestModel({ name: "test1", randomNumber: generateRandomNumber(100) });
          object.save(function() {
            done();
          });
        });

        it("should raise 404 if the model wasn't found", function(done) {
          request.del(testServer + "/tests/" + Mongoose.Types.ObjectId().toString(), function(error, response) {
            response.statusCode.should.equal(404);
            done();
          });
        });

        it("should remove one model", function(done) {
          var requestData = {
            host: 'localhost',
            port: 8080,
            path: '/tests/' + '1234',
            method: 'delete'
          };

          TestModel.count(function(error, firstCount) {
            request.del(testServer + "/tests/" + object._id.toString(), function(error, response, body) {
              TestModel.count(function(error, secondCount) {
                expect(firstCount - secondCount).to.equal(1);
                done();
              });
            });
          });
        });

        after(function(done) {
          object.remove(function() {
            done();
          });
        });
      });

      describe("SHOW", function() {
        var object;
        before(function(done) {
          object = new TestModel({ name: "test1", randomNumber: generateRandomNumber(100) });
          object.save(function() {
            done();
          });
        });

        it("should return a specific model", function(done) {
          request.get(testServer + "/tests/" + object._id, function(err, res, body) {
            var jsonBody = JSON.parse(body);
            jsonBody.should.deep.equal(object.toSimpleObject());
            done();
          });
        });

        it("should raise 404 if a model does not exist", function(done) {
          request.get(testServer + "/tests/" + Mongoose.Types.ObjectId().toString(), function(err, res) {
            res.statusCode.should.equal(404);
            done();
          });
        });

        after(function(done) {
          object.remove(function() {
            done();
          });
        });
      });
    
      describe("INSERT: adding model", function() {
        it("should add a model to the collection", function(done) {
          var objectToInsert = {
            name: "random nameeee",
            randomNumber: generateRandomNumber(200)
          };

          request.put(testServer + "/tests", function(err, res, body) {
            res.statusCode.should.equal(302);
            objectToInsert._id = res.headers.location;

            TestModel.findByIdAndRemove(objectToInsert._id, function(error, modelData) {
              var modelDataObject = modelData.toSimpleObject();
              delete modelDataObject.__v;

              objectToInsert.should.deep.equal(modelDataObject);
            });

            done();
          }).json(objectToInsert);
        });

        it("should not permit values that are not a part of the schema", function(done) {
          var objectToInsert = {
            name: "random nameeee",
            randomNumber: generateRandomNumber(200),
            myCustomValue: 'gal is awesome'
          };

          request.put(testServer + "/tests", function(err, res, body) {
            res.statusCode.should.equal(500);
            done();
          }).json(objectToInsert);
        });
      });

      describe("UPDATE: updating model", function() {
        var object;

        // Create the model
        before(function(done) {
          object = new TestModel({ name: "first name", randomNumber: 1 });
          object.save(function(err, data) {
            done();
          });
        });
        // Destroy the model
        after(function(done) {
          object.remove(function(){
            done();
          });
        });

        it("should update one attribute", function(done) {
          var changes = {
            name: "second name"
          };

          TestModel.findById(object._id, function(err, modelData) {
            request.post(testServer + "/tests/" + object._id, function(err, res, body) {
              var simpleModelData = modelData.toSimpleObject();
              simpleModelData.name = changes.name;

              body.should.deep.equal(simpleModelData);
              done();
            }).json(changes);
          });
        });

        it("should update many attributes at once", function(done) {
          var changes = {
            randomNumber: generateRandomNumber(100),
            name: "third name"
          };

          TestModel.findById(object._id, function(err, modelData) {
            request.post(testServer + "/tests/" + object._id, function(err, res, body) {
              var simpleModelData = modelData.toSimpleObject();
              simpleModelData.name = changes.name;
              simpleModelData.randomNumber = changes.randomNumber;

              body.should.deep.equal(simpleModelData);
              done();
            }).json(changes);
          });
        });

        it("shouldn't update the _id attribute", function(done) {
          var changes = {
            _id: Mongoose.Types.ObjectId()
          };

          TestModel.findById(object._id, function(err, modelData) {
            request.post(testServer + "/tests/" + object._id, function(err, res, body) {
              res.statusCode.should.equal(500);
              done();
            }).json(changes);
          });
        });
      });
    });
  });
});