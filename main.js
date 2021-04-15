const express = require('express');
const bodyParser = require('body-parser');

const products = require('./controllers/products');

const databaseConnexion = require('./database/connexion');

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));

(async () => {
  console.log('coucou');
  const db = await databaseConnexion();

  products(app, db);

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();


  // let count = 0;
  // setInterval(() => {
  //   console.log(`coucou ${count}`);
  //   count += 1;
  // }, 1000);