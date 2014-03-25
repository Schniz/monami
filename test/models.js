module.exports = function(Mongoose) {
  var Tests = new Mongoose.Schema({
    name: String,
    randomNumber: Number
  });

  Tests.methods.toSimpleObject = function() {
    return {
      _id: this._id.toString(),
      name: this.name,
      randomNumber: this.randomNumber,
      __v: this.__v
    };
  }

  Mongoose.model('Test', Tests);
};