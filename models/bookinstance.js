const mongoose = require('mongoose');
const moment = require('moment');

const Schema = mongoose.Schema;

const BookInstanceSchema = Schema({
  book: {
    type: Schema.ObjectId,
    ref: 'Book',
    required: true,
  },
  imprint: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: [
      'Available', 
      'Maintenance',
      'Loaned',
      'Reserved',
    ],
    default: 'Maintenance',
  },
  due_back: {
    type: Date,
    default: Date.now,
  },
});

BookInstanceSchema.virtual('url').get(function() {
  return `/catalog/bookinstance/${this._id}`;
});

BookInstanceSchema.virtual('dueBackFormatted').get(function() {
  return moment(this.due_back).format('YYYY-MM-DD');
});

module.exports = mongoose.model('BookInstance', BookInstanceSchema);