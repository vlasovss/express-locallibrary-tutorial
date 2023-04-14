const async = require('async');
const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator');

const BookInstance = require('../models/bookinstance');
const Book = require('../models/book');

exports.bookInstanceList = (req, res, next) => {
  BookInstance.find()
    .populate('book')
    .exec((err, bookInstanceList) => {
      if (err) {
        return next(err);
      }

      res.render('bookInstance/index', {
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
      
      console.log(bookInstance.due_back);

      res.render('bookInstance/detail', {
        title: `Copy: ${bookInstance.book.title}`,
        bookInstance: bookInstance,
      })
    });
};

exports.bookInstanceCreateGet = (req, res, next) => {
  Book.find({}, 'title')
    .exec((err, bookList) => {
      if (err) {
        return next(err);
      }
      
      res.render('bookInstance/create', {
        title: 'Create BookInstance',
        bookList: bookList,
      })
    });
};

exports.bookInstanceCreatePost = [
  body('book', 'Book must be specified.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('imprint', 'Imprint must be specified.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('status')
    .escape(),
  body('due_back', 'Invalid date.')
    .optional({checkFalsy: true})
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
    });

    if (req.body.due_back) {
      bookInstance.due_back = req.body.due_back;
    }

    if (!errors.isEmpty()) {
      Book.find({}, 'title')
        .exec((err, bookList) => {
          if (err) {
            return next(err);
          }
          
          res.render('bookInstance/create', {
            title: 'Create BookInstance',
            bookList: bookList,
            selectedBook: bookInstance.book._id,
            errors: errors.array(),
            bookInstance: bookInstance,
          });
        });
      return;
    }

    bookInstance.save()
      .then(bookInstance => res.redirect(bookInstance.url))
      .catch(err => next(err));
  },
];

exports.bookInstanceDeleteGet = (req, res, next) => {
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

      res.render('bookInstance/delete', {
        title: `Copy: ${bookInstance.book.title}`,
        bookInstance: bookInstance,
      })
    });
};

exports.bookInstanceDeletePost = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  BookInstance.findByIdAndRemove(id)
  .then(() => res.redirect('/catalog/bookInstances'))
  .catch(err => next(err));
};

exports.bookInstanceUpdateGet = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  
  async.parallel({
    bookInstance: (callback) => {
      BookInstance.findById(id)
        .populate('book')
        .exec(callback);
    },
    bookList: (callback) => {
      Book.find({}, callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.bookInstance == null) {
      const err = new Error('BookInstance Not Found');
      err.status = 404;
      return next(err);
    }

    res.render('bookInstance/create', {
      title: 'Update BookInstance',
      bookInstance: results.bookInstance,
      bookList: results.bookList,
      selectedBook: results.bookInstance.book._id,
    })
  });
};

exports.bookInstanceUpdatePost = [
  body('book', 'Book must be specified.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('imprint', 'Imprint must be specified.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('status')
    .escape(),
  body('due_back', 'Invalid date.')
    .optional({checkFalsy: true})
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);
    
    const bookInstance = new BookInstance({
      book: req.body.book,
      imprint: req.body.imprint,
      status: req.body.status,
      _id: req.params.id,
    });

    if (req.body.due_back) {
      bookInstance.due_back = req.body.due_back;
    }

    if (!errors.isEmpty()) {
      Book.find({})
        .exec((err, bookList) => {
          if (err) {
            return next(err);
          }
          
          res.render('bookInstance/create', {
            title: 'Create BookInstance',
            bookList: bookList,
            selectedBook: bookInstance.book._id,
            errors: errors.array(),
            bookInstance: bookInstance,
          });
        });
      return;
    }

    BookInstance.findByIdAndUpdate(req.params.id, bookInstance, {})
      .then(bookInstance => res.redirect(bookInstance.url))
      .catch(err => next(err));
  },
];