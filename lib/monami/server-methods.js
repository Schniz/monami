require('simpleplan')();

module.exports = function(Mongoose, log, _) {
  var models = Object.keys(Mongoose.models);
  
  var handleErrors = function(res, callback) {
    return function checkForMongoErrors(err, data) {
      if (err) {
        log.error(err);
        return res.status(500).send({ error: "there is an error. "});
      } else if (!data) {
        return res.status(404).send({ error: "object not found" });
      }

      return callback(err, data);
    }
  };

  var getAttributesAllowed = function(model) {
    var attributes = Object.keys(model.schema.paths);

    return _(attributes).without('_id', '__v');
  };

  var getBadAttributes = function(json, model) {
    var attributes = Object.keys(json);
    var attributesAllowed = getAttributesAllowed(model);
    var badAttributes = _(attributes).difference(attributesAllowed);

    return badAttributes.length > 0 ? badAttributes : null;
  };

  var defaultServerMethods = {
    index: function(req, res, next) {
      req.model.find( handleErrors(res, function(err, data) {
        var returnValue = {};
        returnValue[req.params.collectionName] = data;

        res.status(200).send(returnValue);
      }));
    },
    show: function(req, res, next) {
      req.model.findOne({ _id: req.params.modelId }, handleErrors(res, function(err, data) {
        handleErrors(err, data);

        return res.status(200).send(data);
      }));
    },
    destroy: function(req, res, next) {
      req.model.findOneAndRemove({ _id: req.params.modelId }, handleErrors(res, function(err, data) {
        res.status(200).send({ success: true });
      }));
    },
    update: function(req, res, next) {
      var json = req.body;
      var badAttributes = getBadAttributes(json, req.model);

      if (badAttributes) {
        return res.send(500).send({ error: "you specified attributes that are not allowed.", attributes: badAttributes });
      }

      req.model.findOneAndUpdate({ _id: req.params.modelId }, { $set: json }, handleErrors(res, function(err, data) {
        return res.status(200).send(data);
      }));
    },
    insert: function(req, res, next) {
      var json = req.body;
      var badAttributes = getBadAttributes(json, req.model);

      if (badAttributes) {
        return res.send(500).send({ error: "you specified attributes that are not allowed.", attributes: badAttributes });
      }

      new req.model(json).save(handleErrors(res, function(err, data) {
        res.redirect(data._id);
      }));
    }
  };
  var serverMethods = {
    null: defaultServerMethods
  };

  models.forEach(function(model) {
    serverMethods[model] = {
      index: function() { defaultServerMethods.index.apply(this, arguments); },
      show: function() { defaultServerMethods.show.apply(this, arguments); },
      destroy: function() { defaultServerMethods.destroy.apply(this, arguments); },
      update: function() { defaultServerMethods.update.apply(this, arguments); },
      insert: function() { defaultServerMethods.insert.apply(this, arguments); }
    };
  });

  return serverMethods;
}.inject();