const express = require('express');
const bodyParser = require('body-parser');

const products = require('./controllers/products');
const prices = require('./controllers/prices');
const users = require('./controllers/users');

const databaseConnexion = require('./database/connexion');

const passport = require('passport');
const { myPassportLocal, myPassportJWT } = require('./passport');


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  app.use('^/api', passport.authenticate('jwt', { session: false }));
  console.log('Bienvenue sur le projet SGBD de Quentin Herpoel ...');
  const db = await databaseConnexion();

  //passport
  myPassportLocal(db);
  myPassportJWT(db);

  //import controllers
  products(app, db);
  prices(app, db);
  users(app, db);

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
