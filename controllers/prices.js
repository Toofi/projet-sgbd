const { response } = require('express');
const { Db, ObjectID } = require('mongodb');
const Puppeteer = require('./puppeteer');

let cron = require('node-cron');

module.exports = async (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const pricesCollection = db.collection("prices");
  const productsCollection = db.collection("products");

  let productsIdAndUrls = await productsCollection.aggregate([{
    $project: { id: 1, url: 1 }
  }]).toArray();

  let puppet = new Puppeteer();

  let scanPrices = async (products) => {
    try {

      for (e in products) {
        let scrappedPrice = await puppet.scrapPrice(products[e].url);
        let data = {
          productId: new ObjectID(products[e]._id),
          date: new Date(),
          price: scrappedPrice.price,
          isPromo: scrappedPrice.isPromo,
        };
        const response = await pricesCollection.insertOne(data)
        if (response.result.n !== 1 || response.result.ok !== 1) {
          console.log("impossible to create the price");
        }
        const [price] = response.ops;
        console.log('༼ つ ◕_◕ ༽つ '+e+': postPrices ok');
      }
    } catch (e) {
      console.log(e);
    }
  };

  cron.schedule('1 * * * *', () => {
    console.log('scan de tous les produits toutes les heures ...');
    scanPrices(productsIdAndUrls);
  });

  app.get('/api/prices', async (req, res) => {
    let prices = await pricesCollection.find().toArray();
    res.json(prices);
  });

};
