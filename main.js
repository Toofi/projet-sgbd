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
  // let puppet = new Puppeteer();
  // let result = await puppet.scrapNameAndImage(
  //   "https://www.amazon.fr/OneOdio-Visioconf%C3%A9rence-Compatible-Ordinateur-Smartphone/dp/B08DHZSR9F/?_encoding=UTF8&smid=A377QUK6D1UVSZ&pd_rd_w=9H65s&pf_rd_p=a69614f8-aca2-43f3-a11b-c55ab3dcb961&pf_rd_r=EMDRMYS24B64SNJXTECY&pd_rd_r=7e102c89-0e21-455c-b889-3a164b7177a1&pd_rd_wg=XeMxu&ref_=pd_gw_unk");
  // console.log(result);
  const db = await databaseConnexion();

  products(app, db);
  prices(db);

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();
