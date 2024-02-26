const express = require("express");
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const { resizeImage } = require('../middlewares/multer-config');
const bookCtrl = require('../controllers/book');

router.get('/', bookCtrl.getAllBooks);
router.get('/bestrating', bookCtrl.getBestRating);
router.post('/', auth, multer, resizeImage, bookCtrl.createBook);
router.get('/:id', bookCtrl.getOneBook );
router.put('/:id', auth, multer, resizeImage, bookCtrl.modifyBook);
router.delete('/:id', auth, bookCtrl.deleteBook);
router.post('/:id/rating', auth, bookCtrl.createRating);

module.exports = router;