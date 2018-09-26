const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
app.use(express.static('public'));

mongoose.Promise = global.Promise;

const {PORT, DATABASE_URL} = require('./config');
const {User, List, Movie} = require('./models');

const listsRouter = require('./lists');
const moviesRouter = require('./movies');

app.use(morgan('common'));
app.use('/lists', listsRouter);
app.use('/movies', moviesRouter);

let server;

function runServer(databaseUrl, port = PORT) {
  return new Promise((resolve, reject) => {
    mongoose.connect(databaseUrl, { useNewUrlParser: true }, err => {
      if (err) {
        return reject(err);
      }
      server = app.listen(port, () => {
        console.log(`Your app is listening on port ${port}`);
        resolve();
      })
        .on('error', err => {
          mongoose.disconnect();
          reject(err);
        });
    });
  });
}

function closeServer() {
  return mongoose.disconnect().then(() => {
    return new Promise((resolve, reject) => {
      console.log('Closing server');
      server.close(err => {
        if (err) {
          return reject(err);
        }
        resolve();
      });
    });
  });
}

if (require.main === module) {
  runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };
