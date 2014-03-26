require('simpleplan')();

module.exports = function(Mongoose, log) {
  var models = Object.keys(Mongoose.models);
  var defaultServerMethods = {
    index: function(req, res, next) {
      req.model.find(function(err, data) {
        if (err) {
          log.error(err);
          return res.status(500).send({ error: "there is an error. "});
        }

        var returnValue = {};
        returnValue[req.params.collectionName] = data;

        res.status(200).send(returnValue);
      });
    },
    show: function(req, res, next) {
      req.model.findOne({ _id: req.params.modelId }, function(err, data) {
        if (err) {
          log.error(err);
          return res.status(500).send({ error: "there is an error. "});
        } else if (!data) {
          return res.status(404).send({ error: "object not found" });
        }

        return res.status(200).send(data);        
      });
    },
    destroy: function(req, res, next) {
      req.model.findOneAndRemove({ _id: req.params.modelId }, function(err, data) {
        if (err) {
          log.error(err);
          return res.status(500).send({ error: "there is an error. "});
        } else if (!data) {
          return res.status(404).send({ error: "object not found" });
        }

        res.status(200).send({ success: true });
      });
    },
    update: function(req, res, next) {
      req.model.findOneAndUpdate({ _id: req.params.modelId }, { $set: req.body }, function(err, data) {
        if (err) {
          log.error(err);
          return res.status(500).send({ error: "there is an error. "});
        } else if (!data) {
          return res.status(404).send({ error: "object not found" });
        }

        return res.status(200).send(data);
      });
    },
    insert: function(req, res, next) {}
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