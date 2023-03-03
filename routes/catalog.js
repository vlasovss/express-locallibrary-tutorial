const express = require('express');
const router = express.Router();

const authorController = require('../controllers/authorController');
const bookInstanceController = require('../controllers/bookInstanceController');
const bookController = require('../controllers/bookController');
const genreController = require('../controllers/genreController');

// Home Page
router.get('/', bookController.index);

// Book routers
router.get('/book/create', bookController.bookCreateGet);
router.post('/book/create', bookController.bookCreatePost);
router.get('/book/delete/:id', bookController.bookDeleteGet);
router.post('/book/delete/:id', bookController.bookDeletePost);
router.get('/book/update/:id', bookController.bookUpdateGet);
router.post('/book/update/:id', bookController.bookUpdatePost);
router.get('/book/:id', bookController.bookDetail);
router.get('/books', bookController.bookList)

// Author routers
router.get('/author/create', authorController.authorCreateGet);
router.post('/author/create', authorController.authorCreatePost);
router.get('/author/delete/:id', authorController.authorDeleteGet);
router.post('/author/delete/:id', authorController.authorDeletePost);
router.get('/author/update/:id', authorController.authorUpdateGet);
router.post('/author/update/:id', authorController.authorUpdatePost);
router.get('/author/:id', authorController.authorDetail);
router.get('/authors', authorController.authorList)

// Genre routers
router.get('/genre/create', genreController.genreCreateGet);
router.post('/genre/create', genreController.genreCreatePost);
router.get('/genre/delete/:id', genreController.genreDeleteGet);
router.post('/genre/delete/:id', genreController.genreDeletePost);
router.get('/genre/update/:id', genreController.genreUpdateGet);
router.post('/genre/update/:id', genreController.genreUpdatePost);
router.get('/genre/:id', genreController.genreDetail);
router.get('/genres', genreController.genreList)

// BookInstance routers
router.get('/bookinstance/create', bookInstanceController.bookInstanceCreateGet);
router.post('/bookinstance/create', bookInstanceController.bookInstanceCreatePost);
router.get('/bookinstance/delete/:id', bookInstanceController.bookInstanceDeleteGet);
router.post('/bookinstance/delete/:id', bookInstanceController.bookInstanceDeletePost);
router.get('/bookinstance/update/:id', bookInstanceController.bookInstanceUpdateGet);
router.post('/bookinstance/update/:id', bookInstanceController.bookInstanceUpdatePost);
router.get('/bookinstance/:id', bookInstanceController.bookInstanceDetail);
router.get('/bookinstances', bookInstanceController.bookInstanceList)

module.exports = router;