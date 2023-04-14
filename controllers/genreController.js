const async = require('async');
const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator');

const Genre = require('../models/genre');
const Book = require('../models/book')

exports.genreList = (req, res, next) => {
  Genre.find()
    .sort([['name', 'ascending']])
    .exec((err, genreList) => {
      if (err) {
        return next(err);
      }

      res.render('genre/index', {
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

    res.render('genre/detail', {
      title: 'Genre Detail',
      genre: results.genre, 
      bookList: results.bookList,
    });
  });
}

exports.genreCreateGet = (req, res) => {
  res.render('genre/create', {
    title: 'Create Genre',
  });
};

exports.genreCreatePost = [
  body('name', 'Genre name required.')
    .trim()
    .isLength({min: 1})
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre ({
      name: req.body.name,
    });

    if ( !errors.isEmpty() ) {
      res.render('genre/create', {
        title: 'Create Genre',
        genre: genre,
        errors: errors.array(),
      })
      return;
    }
    
    Genre.findOne({'name': req.body.name})
      .exec((err, foundGenre) => {
        if (err) {
          return next(err);
        }

        if (foundGenre) {
          res.redirect(foundGenre.url);
        }

        genre.save((err) => {
          if (err) {
            return next(err);
          }
          res.redirect(genre.url);
        });
      });
    }
];

exports.genreDeleteGet = (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  async.parallel({
    genre: (callback) => {
      Genre.findById(id)
        .exec(callback);
    },
    bookList: (callback) => {
      Book.find({'genre': id})
        .exec(callback);
    }, 
  }, 
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.genre == null) {
      res.redirect('catalog/genres');
    }

    res.render('genre/delete', {
      title: 'Genre Delete',
      genre: results.genre, 
      genreBooks: results.bookList,
    });
  });
};

exports.genreDeletePost = (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  async.parallel({
    genre: (callback) => {
      Genre.findById(id)
        .exec(callback);
    },
    genreBooks: (callback) => {
      Book.find({genre: id}, callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.genreBooks > 0) {
      res.render('author/delete', {
        title: 'Delete Author',
        author: results.author,
        authorBooks: results.genreBooks,
      });
      return;
    }

    Genre.findByIdAndRemove(id)
      .then(() => res.redirect('/catalog/genres'))
      .catch(err => next(err));
  });
};

exports.genreUpdateGet = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);
  
  Genre.findById(id, (err, genre) => {
    if (err) {
      return next(err);
    }
    
    if (genre == null) {
      const err = new Error('Genre not found');
      err.status = 404;
      return next(err);
    }

    res.render('genre/create', {
      title: 'Update Genre',
      genre: genre,
    });
  });
};

exports.genreUpdatePost = [
  body('name', 'Genre name required.')
    .trim()
    .isLength({min: 1})
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);

    const genre = new Genre ({
      name: req.body.name,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      res.render('genre/create', {
        title: 'Update Genre',
        genre: genre,
        errors: errors.array(),
      })
      return;
    }
    
    Genre.findByIdAndUpdate(req.params.id, genre, {})
      .then(genre => res.redirect(genre.url))
      .catch(err => next(err));
    }
];