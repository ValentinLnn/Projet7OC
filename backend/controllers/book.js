const Book = require('../models/book');
const fs = require('fs');
exports.createBook =  (req, res) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.replace(/\.[^.]*$/, '.webp')}`,
    averageRating: bookObject.ratings[0].grade,
  });

  book.save()
  .then(() => res.status(201).json({ message: 'Livre enregistré !'}))
  .catch(error => res.status(400).json({ error }));
};

exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ error }));
};

exports.modifyBook =  (req, res) => {
  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename.replace(/\.[^.]*$/, '.webp')}`
  } : { ...req.body };

  delete bookObject._userId;
  Book.findOne({_id: req.params.id })
  .then((book) => {
    if(book.userId != req.auth.userId) {
      res.status(403).json({ message : 'Non-autorisé' });
    } else  {
      const filename = book.imageUrl.split('/images/')[1];

      req.file && fs.unlink(`images/${filename}`, 
      (err => {
        if (err) console.log(err);
      })
    );
      Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
      .then(() => res.status(200).json({ message: 'Livre modifié !'}))
      .catch(error => res.status(401).json({ error })); 
    }
  })
  .catch((error) =>{
      res.status(400).json({ error });
  });
};

exports.deleteBook =  (req, res) => {
    Book.findOne({ _id: req.params.id })
      .then(book => {
        if (book.userId != req.auth.userId) {
          res.status(401).json({message: 'Non autorisé'});
        } else {
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({_id: req.params.id})
            .then(() => {res.status(200).json({message: 'Livre supprimé !'})})
            .catch(error => res.status(401).json({error}));
          });
        }
      })
      .catch(error => {
        res.status(500).json({ error })
      });
};


exports.getAllBooks = (req, res) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(404).json({ error }));
};

exports.createRating = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (req.auth.userId === book.ratings.userId) {
        res.status(401).json({ message: "Unauthorized" });
      } else {
        const rating = {
          userId: req.body.userId,
          grade: req.body.rating,
        };
        book.ratings.push(rating);
        book.averageRating = Math.round(
          (book.ratings.reduce((a, b) => a + b.grade, 0) / book.ratings.length) * 10
        ) / 10;
        book
          .save()
          .then((book) => res.status(200).json(book))
          .catch((error) => res.status(404).json({ error }));
      }
    })
    .catch((error) => res.status(500).json(error));
};
exports.getBestRating = (req, res) => {
  Book.find()
  .sort({averageRating: -1}).limit(3)
  .then((books) => res.status(200).json(books))
  .catch((error) => res.status(404).json({ error }));
};