const express = require('express');
const mongoose = require('mongoose');
const app = express();
const bookRoutes = require('./routes/book');
const userRoutes = require('./routes/user');
const path = require('path');
const cors = require('cors');

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_CLUSTER}.mongodb.net/?retryWrites=true&w=majority`,
{ useNewUrlParser: true,
  useUnifiedTopology: true })
.then(() => console.log('Connexion à MongoDB réussie !'))
.catch(() => console.log('Connexion à MongoDB échouée !'));


app.use(express.json());

app.use(cors());

app.use('/api/auth', userRoutes);
app.use('/api/books', bookRoutes);


app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;