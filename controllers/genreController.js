const async = require('async');
const mongoose = require('mongoose');

const Genre = require('../models/genre');
const Book = require('../models/book')

exports.genreList = (req, res, next) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, genreList) => {
      if (err) {
        return next(err);
      }

      res.render('genreList', {
        title: 'Genre List',
        genreList: genreList,
      });
    })
};

exports.genreDetail = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  async.parallel({
    genre: (callback) => {
      Genre.findById(id)
        .exec(callback);
    },
    bookList: (callback) => {
      Book.find({'genre': id})
        .populate('author')
        .select('title author summary')
        .sort([['title', 'ascending']])
        .exec(callback);
    }, 
  }, 
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.genre == null) {
      const err = new Error('Genre Not Found');
      err.status = 404;
      return next(err);
    }

    res.render('genreDetail', {
      title: 'Genre Detail',
      genre: results.genre.name, 
      bookList: results.bookList,
    });
  });
}

exports.genreCreateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre create GET');
};

exports.genreCreatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre create POST');
};

exports.genreDeleteGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre delete GET');
};

exports.genreDeletePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre delete POST');
};

exports.genreUpdateGet = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update GET');
};

exports.genreUpdatePost = (req, res) => {
  res.send('NOT IMPLEMENTED: Genre update POST');
};