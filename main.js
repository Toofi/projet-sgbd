const express = require('express');

const databaseConnexion = require('./database/connexion');

const app = express();
const port = 3000;

(async () => {
  console.log('coucou');
  const db = await databaseConnexion();
  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();


  // let count = 0;
  // setInterval(() => {
  //   console.log(`coucou ${count}`);
  //   count += 1;
  // }, 1000);