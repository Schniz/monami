module.exports = function(defaultConfiguration) {
  var Mongoose = defaultConfiguration.Mongoose;
  var _ = defaultConfiguration._;
  var serverMethods = defaultConfiguration.serverMethods;

  return function(model, overrides) {
    if (!_(Mongoose.models).has(model)) {
      throw Error("Model " + model + " does not exist");
    }

    _(serverMethods[model]).extend(overrides);
  };
}