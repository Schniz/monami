require('simpleplan')();

module.exports = function(reopenModel, serverMethods, _) {
  return function(overrides) {
    serverMethods[null] = _(serverMethods[null]).extend(overrides);
  };
}.inject();