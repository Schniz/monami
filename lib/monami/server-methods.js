module.exports = function(defaultConfiguration) {
  var Mongoose = defaultConfiguration.Mongoose;  
  var models = Object.keys(Mongoose.models);
  var defaultServerMethods = {
    index: function(req, res, next) {
      req.model.find(function(err, data) {
        if (err) {
          console.log(err);
          res.status(500).send({ error: "there is an error. "});
        }

        var returnValue = {};
        returnValue[req.params.collectionName] = data;

        res.status(200).send(returnValue);
      });
    },
    show: function(req, res, next) {},
    destroy: function(req, res, next) {},
    update: function(req, res, next) {},
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
};