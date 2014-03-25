require('simpleplan')();

module.exports = function(_, Mongoose, app, serverMethods, requireRelative) {
  // Returns { tests: Test }
  var collections = _(Mongoose.models).chain().map(function(value, key) {
    return [value.collection.name, key];
  }).object().value();

  var dependencies = {
    collections: collections,
    Mongoose: Mongoose,
    _: _,
    serverMethods: serverMethods
  };

  var routing = requireRelative('monami/routing')(dependencies);

  // Base Router
  app.get("/:collectionName", routing('index'));
  app.put("/:collectionName", routing('insert'));
  app.get("/:collectionName/:modelId", routing('show'));
  app.delete("/:collectionName/:modelId", routing('destroy'));
  app.post("/:collectionName/:modelId", routing('update'));
}.inject();