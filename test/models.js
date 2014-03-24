module.exports = function(Mongoose) {
  var models = {};

  var Tests = new Mongoose.Schema({
    name: String,
    randomNumber: Number
  });

  Mongoose.model('Test', Tests);
};