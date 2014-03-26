require('simpleplan')();

module.exports = function(Mongoose, log) {
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
      req.model.findOneAndUpdate({ _id: req.params.modelId }, { $set: req.body }, handleErrors(res, function(err, data) {
        return res.status(200).send(data);
      }));
    },
    insert: function(req, res, next) {
      new req.model(req.body).save(handleErrors(res, function(err, data) {
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