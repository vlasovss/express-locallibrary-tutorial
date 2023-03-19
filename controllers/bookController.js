const async = require('async');
const mongoose = require('mongoose');

const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
const Author = require('../models/author');
const Genre = require('../models/genre');

exports.index = (req, res) => {
  async.parallel({
    bookCount: (callback) => {
      Book.countDocuments({}, callback);
    },
    bookInstanceCount: (callback) => {
      BookInstance.countDocuments({}, callback);
    },
    bookInstanceAvailableCount: (callback) => {
      BookInstance.countDocuments({status: 'Available'}, callback);
    },
    authorCount: (callback) => {
      Author.countDocuments({}, callback);
    },
    genreCount: (callback) => {
      Genre.countDocuments({}, callback);
    },
  }, 
  (err, results) => {
    res.render('index', {
      title: 'Local Library Home',
      error: err,
      data: results,
    });
  });
};

exports.bookList = (req, res, next) => {
  Book.find()
    .populate('author')
    .select('title author')
    .exec((err, bookList) => {
      if (err) {
        return next(err);
      }
      
      res.render('bookList', {
        title: 'Book List',
        bookList: bookList,
      });
    });
};

exports.bookDetail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    book: (callback) => {
      Book.findById(id)
        .populate('author')
        .populate('genre')
        .exec(callback);
    },
    bookInstanceList: (callback) => {
      BookInstance.find({'book': id})
        .exec(callback)
    },
  }, 
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.book == null) {
      const err = new Error('Book Not Found');
      err.status = 404;
      return next(err);
    }

    res.render('bookDetail', {
      title: `Detail Book - ${results.book.title}`,
      book: results.book,
      bookInstanceList: results.bookInstanceList,
    });
  });
};

exports.bookCreateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Book create GET');
};

exports.bookCreatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Book create POST');
};

exports.bookDeleteGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete GET');
};

exports.bookDeletePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Book delete POST');
};

exports.bookUpdateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update GET');
};

exports.bookUpdatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Book update POST');
};