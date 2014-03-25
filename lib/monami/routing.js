require("simpleplan")();

module.exports = function(Mongoose, collections, _, serverMethods) {
  return function(method) {
    return function index(req, res, next) {
      if (!_(collections).has(req.params.collectionName)) {
        return res.status(404).end("Not found");
      }

      var modelName = collections[req.params.collectionName];
      req.model = Mongoose.models[modelName];

      return serverMethods[modelName][method](req, res, next);
    };
  };
}.inject();