require('simpleplan')();

module.exports = function() {
  return {
    error: function() {},
    warn: function() {},
    log: function() {},
    info: function() {}
  };
}.inject();