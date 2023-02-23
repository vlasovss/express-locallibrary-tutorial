const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    max: 100,
  },
  lastName:  {
    type: String,
    required: true,
    max: 100,
  },
  dateOfBirth: {
    type: Date,
  },
  dateOfDeath: {
    type: Date,
  },
});

AuthorSchema.virtual('name').get(() => {
  return `${this.firstName} ${this.lastName}`;
});
AuthorSchema.virtual('url').get(() => {
  return '/catalog/author/' + this._id;
});

module.exports = mongoose.model('Author', AuthorSchema);