const mongoose = require('mongoose');

const BookInstance = require('../models/bookinstance');

exports.bookInstanceList = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec((err, bookInstanceList) => {
      if (err) {
        return next(err);
      }

      res.render('bookInstanceList', {
        title: 'Book Instance List',
        bookInstanceList: bookInstanceList,
      });
    });
};

exports.bookInstanceDetail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  BookInstance.findById(id)
    .populate('book')
    .exec((err, bookInstance) => {
      if (err) {
        return next(err);
      }

      if (bookInstance == null) {
        const err = new Error('Book Copy Not Found');
        err.status = 404;
        return next(err);
      }

      res.render('bookInstanceDetail', {
        title: `Copy: ${bookInstance.book.title}`,
        bookInstance: bookInstance,
      })
    });
};

exports.bookInstanceCreateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance create GET');
};

exports.bookInstanceCreatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance create POST');
};

exports.bookInstanceDeleteGet = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance delete GET');
};

exports.bookInstanceDeletePost = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance delete POST');
};

exports.bookInstanceUpdateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance update GET');
};

exports.bookInstanceUpdatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: BookInstance update POST');
};