const async = require('async');
const mongoose = require('mongoose');

const Author = require('../models/author');
const Book = require('../models/book')

exports.authorList = (req, res, next) => {
  Author.find()
    .sort([['lastName', 'ascending']])
    .exec((err, authorList) => {
      if (err) {
        return next(err);
      }

      res.render('authorList', {
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

    res.render('authorDetail', {
      title: `Author Detail - ${results.author.name}`,
      author: results.author,
      bookList: results.bookList,
    })
  });
};

exports.authorCreateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Author create GET');
};

exports.authorCreatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Author create POST');
};

exports.authorDeleteGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Author delete GET');
};

exports.authorDeletePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Author delete POST');
};

exports.authorUpdateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update GET');
};

exports.authorUpdatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Author update POST');
};