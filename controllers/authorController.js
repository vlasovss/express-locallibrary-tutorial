const async = require('async');
const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator');

const Author = require('../models/author');
const Book = require('../models/book');
const book = require('../models/book');

exports.authorList = (req, res, next) => {
  Author.find()
    .sort([['lastName', 'ascending']])
    .exec((err, authorList) => {
      if (err) {
        return next(err);
      }

      res.render('author/index', {
        title: 'Author List',
        authorList: authorList
      });
    });
};

exports.authorDetail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    author: (callback) => {
      Author.findById(id)
        .exec(callback);
    },
    bookList: (callback) => {
      Book.find({'author': id})
        .populate('genre')
        .select('title genre summary')
        .sort([['genre', 'ascending']])
        .exec(callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.author == null) {
      const err = new Error('Author Not Found')
      err.status = 404;
      return next(err)
    }

    res.render('author/detail', {
      title: `Author Detail - ${results.author.name}`,
      author: results.author,
      bookList: results.bookList,
    })
  });
};

exports.authorCreateGet = (req, res) => {
  res.render('author/create', {
    title: 'Create Author',
  });
};

exports.authorCreatePost = [
  body('firstName')
    .trim()
    .isLength({mim: 1}).withMessage('First name must be specified')
    .escape()
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('lastName')
    .trim()
    .isLength({min: 1}).withMessage('Last name must be specified')
    .escape()
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('dateOfBirth', 'Invalid date of birth.')
    .optional({checkFalsy: true})
    .isISO8601()
    .toDate(),
  body('dateOfDeath', 'Invalid date of death.')
    .optional({checkFalsy: true})
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      dateOfDeath: req.body.dateOfDeath,
    });

    if (!errors.isEmpty()) {
      res.render('author/create', {
        title: 'Create Author',
        author: author,
        errors: errors.array(),
      });
      return;
    }

    author.save()
      .then(author => res.redirect(author.url))
      .catch(err => next(err));
  }
];

exports.authorDeleteGet = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  async.parallel({
    author: (callback) => {
      Author.findById(id)
        .exec(callback);
    },
    authorBooks: (callback) => {
      Book.find({author: id}, callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.author == null) {
      res.redirect('/catalog/authors')
    }
    
    res.render('author/delete', {
      title: 'Delete Author',
      author: results.author,
      authorBooks: results.authorBooks,
    })
  });
};

exports.authorDeletePost = (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  async.parallel({
    author: (callback) => {
      Author.findById(id)
        .exec(callback);
    },
    authorBooks: (callback) => {
      Book.find({author: id}, callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.authorBooks > 0) {
      res.render('author/delete', {
        title: 'Delete Author',
        author: results.author,
        authorBooks: results.authorBooks,
      });
      return;
    }
    Author.findByIdAndRemove(id, (err) => {
      if (err) {
        return next(err);
      }

      res.redirect('/catalog/authors');
    });
  });
};

exports.authorUpdateGet = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  Author.findById(id, (err, author) => {
    if (err) {
      return next(err);
    }

    if (author == null) {
      const err = new Error('Author Not Found');
      err.status = 404;
      return next(err);
    }

    res.render('author/create', {
      title: 'Update Author',
      author: author,
    });
  });
};

exports.authorUpdatePost = [
  body('firstName')
    .trim()
    .isLength({mim: 1}).withMessage('First name must be specified')
    .escape()
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('lastName')
    .trim()
    .isLength({min: 1}).withMessage('Last name must be specified')
    .escape()
    .isAlphanumeric().withMessage('First name has non-alphanumeric characters.'),
  body('dateOfBirth', 'Invalid date of birth.')
    .optional({checkFalsy: true})
    .isISO8601()
    .toDate(),
  body('dateOfDeath', 'Invalid date of death.')
    .optional({checkFalsy: true})
    .isISO8601()
    .toDate(),
  (req, res, next) => {
    const errors = validationResult(req);

    const author = new Author({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      dateOfBirth: req.body.dateOfBirth,
      dateOfDeath: req.body.dateOfDeath,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('author/create', {
        title: 'Create Author',
        author: author,
        errors: errors.array(),
      });
      return;
    }

    Author.findByIdAndUpdate(req.params.id, author, {})
      .then(author => res.redirect(author.url))
      .catch(err => next(err));
  }
];