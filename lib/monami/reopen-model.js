require('simpleplan')();

module.exports = function(Mongoose, _, serverMethods) {
  return function(model, overrides) {
    if (!_(Mongoose.models).has(model)) {
      throw Error("Model " + model + " does not exist");
    }

    serverMethods[model] = _(serverMethods[model]).extend(overrides);
  };
}.inject();