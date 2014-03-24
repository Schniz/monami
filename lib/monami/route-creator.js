module.exports = function(defaultConfiguration) {
  var Mongoose = defaultConfiguration.Mongoose;
  var _ = defaultConfiguration._;
  var app = defaultConfiguration.app;
  var serverMethods = defaultConfiguration.serverMethods;

  // Returns { tests: Test }
  var collections = _(Mongoose.models).chain().map(function(value, key) {
    return [value.collection.name, key];
  }).object().value();

  app.get("/:collectionName", function(req, res, next) {
    if (!_(collections).has(req.params.collectionName)) {
      res.status(404).end("Not found");
    }

    var modelName = collections[req.params.collectionName];
    req.model = Mongoose.models[modelName];

    return serverMethods[modelName].index(req, res, next);
  });
};