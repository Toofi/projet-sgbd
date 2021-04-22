const express = require('express');
const bodyParser = require('body-parser');

const Puppeteer = require('./controllers/puppeteer');

const products = require('./controllers/products');

const databaseConnexion = require('./database/connexion');
const prices = require('./controllers/prices');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  console.log('Bienvenue sur le projet SGBD de Quentin Herpoel ...');
  const db = await databaseConnexion();

  products(app, db);
  prices(app, db);

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
