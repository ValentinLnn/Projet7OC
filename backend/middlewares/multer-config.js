const multer = require('multer');
const sharp = require('sharp');
const fs = require('fs');

const MIME_TYPES = {
    "image/jpg": "jpg",
    "image/jpeg": "jpg",
    "image/png": "png",
  };

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, "images");
    },
    filename: (req, file, callback) => {
        const name = file.originalname.split(' ').join('_');
        const extension = MIME_TYPES[file.mimetype];
        callback(null, name + Date.now() + '.' + extension);
    }
});

module.exports = multer({ storage: storage }).single('image');

module.exports.resizeImage = (req, res, next) => {
    if (!req.file) {
      return next();
    }
  
    const filePath = req.file.path;
    const outputFilePath = filePath.replace(/\.[^.]*$/, '.webp');
  
    sharp(filePath)
        .resize({width: 460, height: 600})
        .toFormat('webp')
        .toFile(outputFilePath)
        .then(() => {
        fs.unlink(filePath, (err) => {
            if (err) {
            console.error('Erreur lors de la suppression du fichier original :', err);
            }
            req.file.path = outputFilePath;
            next();
        });
        })
        .catch(err => {
        console.error('Erreur lors du redimensionnement et de la conversion en WebP :', err);
        return next();
    });
  };


