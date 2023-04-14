const async = require('async');
const mongoose = require('mongoose');
const {body, validationResult} = require('express-validator');

const Book = require('../models/book');
const BookInstance = require('../models/bookinstance');
const Author = require('../models/author');
const Genre = require('../models/genre');
const { authorList } = require('./authorController');

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
      
      res.render('book/index', {
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
      BookInstance.find({'book': id}, callback)
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

    res.render('book/detail', {
      title: `Detail Book - ${results.book.title}`,
      book: results.book,
      bookInstanceList: results.bookInstanceList,
    });
  });
};

exports.bookCreateGet = (req, res, next) => {
  async.parallel({
    authors: (callback) => {
      Author.find({}, callback);
    },
    genres: (callback) => {
      Genre.find({}, callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    res.render('book/create', {
      title: 'Create Book',
      authors: results.authors,
      genres: results.genres,
    });
  });
};

exports.bookCreatePost = [
  (req, res, next) => {
    if (!Array.isArray(req.body.genre)) {
      req.body.genre = 
        typeof req.body.genre === undefined ? [] : [req.body.genre]
    }
    next();
  },

  body('title', 'Title must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('author', 'Author must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('isbn', 'ISBN must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('genre.*', 'Title must not be empty.')
    .escape(),

  (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
    });

    if (!errors.isEmpty()) {
      async.parallel({
        authors: (callback) => { 
          Author.find({}, callback); 
        },
        genres: (callback) => { 
          Genre.find({}, callback); 
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        
        for (const genre of results.genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = 'true';
          }
        }

        res.render('book/create', {
          title: 'Create Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array(),
        });
      });
      return;
    }

    book.save()
      .then(book => res.redirect(book.url))
      .catch(err => next(err));
  },
];

exports.bookDeleteGet = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  async.parallel({
    book: (callback) => {
      Book.findById(id)
        .exec(callback);
    },
    bookInstanceList: (callback) => {
      BookInstance.find({book: id}, callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.book == null) {
      res.redirect('/catalog/books');
    }
    
    res.render('book/delete', {
      title: 'Delete Book',
      book: results.book,
      bookInstanceList: results.bookInstanceList,
    })
  });
};

exports.bookDeletePost = (req, res) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  async.parallel({
    book: (callback) => {
      Book.findById(id)
        .exec(callback);
    },
    bookInstanceList: (callback) => {
      BookInstance.find({book: id}, callback);
    },
  },
  (err, results) => {
    if (err) {
      return next(err);
    }

    if (results.bookInstanceList > 0) {
      res.render('book/delete', {
        title: 'Delete Book',
        book: results.book,
        bookInstanceList: results.bookInstanceList,
      })
      return;
    }

    Book.findByIdAndRemove(id)
      .then(() => res.redirect('/catalog/books'))
      .catch(err => next(err));
  });
};

exports.bookUpdateGet = (req, res, next) => {
  const id = mongoose.Types.ObjectId(req.params.id);

  async.parallel(
    {
      book: (callback) => {
        Book.findById(id)
          .populate('author')
          .populate('genre')
          .exec(callback);
      },
      authors: (callback) => {
        Author.find({}, callback);
      },
      genres: (callback) => {
        Genre.find({}, callback);
      },
    },
    (err, results) => {
      if (err) {
        return next(err);
      }

      if (results.book == null) {
        const err = new Error('Book not found');
        err.status = 404;
        return next(err);
      }

      for (const genre of results.genres) {
        for (const bookGenre of results.book.genre) {
          if (genre._id.toString() === bookGenre._id.toString()) {
            genre.checked = 'true';
          }
        }
      }

      res.render('book/create', {
        title: 'Update book',
        book: results.book,
        authors: results.authors,
        genres: results.genres,
      })
    }
  );
};

exports.bookUpdatePost = [
  (req, res, next) => {
    if (!Array.isArray(req.params.genre)) {
      req.params.genre = 
        typeof req.params.genre === 'undefined' ? [] : [req.params.genre];
    }
    next();
  },
  
  body('title', 'Title must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('author', 'Author must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('summary', 'Summary must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('isbn', 'ISBN must not be empty.')
    .trim()
    .isLength({min: 1})
    .escape(),
  body('genre.*', 'Title must not be empty.')
    .escape(),
  
  (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      isbn: req.body.isbn,
      genre: req.body.genre,
      _id: req.params.id,
    });

    if (!errors.isEmpty()) {
      async.parallel({
        authors: (callback) => { 
          Author.find({}, callback); 
        },
        genres: (callback) => { 
          Genre.find({}, callback); 
        },
      },
      (err, results) => {
        if (err) {
          return next(err);
        }
        
        for (const genre of results.genres) {
          if (book.genre.includes(genre._id)) {
            genre.checked = 'true';
          }
        }

        res.render('book/create', {
          title: 'Update Book',
          authors: results.authors,
          genres: results.genres,
          book: book,
          errors: errors.array(),
        });
      });
      return;
    }

    Book.findByIdAndUpdate(req.params.id, book, {})
      .then(book => res.redirect(book.url))
      .catch(err => next(err));
  },
];