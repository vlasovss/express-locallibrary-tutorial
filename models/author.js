const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const AuthorSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    max: 100,
  },
  lastName: {
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

AuthorSchema.virtual('name').get(function() {
  return `${this.firstName}, ${this.lastName}`;
});

AuthorSchema.virtual('url').get(function() {
  return `/catalog/author/${this._id}`
});

AuthorSchema.virtual('dateOfBirthF').get(function() {
  return moment(this.dateOfBirth).format('YYYY-MM-DD');
});

AuthorSchema.virtual('dateOfDeathF').get(function() {
  return moment(this.dateOfDeath).format('YYYY-MM-DD');
});

AuthorSchema.virtual('yearsOfLife').get(function() {
  const dateOfBirthFormated = this.dateOfBirth ? 
    `${moment(this.dateOfBirth).format('DD MMMM YYYY')}` : null;
  const dateOfDeathFormated = this.dateOfDeath ? 
    `${moment(this.dateOfDeath).format('DD MMMM YYYY')}` : null;

  return `${dateOfBirthFormated ?? 'неизв.'} - ${dateOfDeathFormated ?? 'неизв.'}`
});

module.exports = mongoose.model('Author', AuthorSchema);