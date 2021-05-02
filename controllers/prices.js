const { response } = require('express');
const { Db, ObjectID, Decimal128 } = require('mongodb');
const Puppeteer = require('./puppeteer');

let cron = require('node-cron');

module.exports = async (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const pricesCollection = db.collection("prices");
  const productsCollection = db.collection("products");
  const alertsCollection = db.collection("alerts");

  let productsIdAndUrls = await productsCollection.aggregate([{
    $project: { id: 1, url: 1 }
  }]).toArray();

  let toDecimal = (price) => {
    if (price.includes('€')) {
      return price.replace('€', '').trim().replace(',', '.');
    }
  }

  let getLatestPrice = async (productId) => {
    try {
      const latestPrice = await pricesCollection.aggregate([
        {
          $match: {
            productId: productId
          }
        }, {
          $group: {
            _id: null,
            latestDocId: {
              $max: '$_id'
            },
            latestPrice: {
              $max: '$price'
            }
          }
        }, {
          $project: {
            _id: 0,
            latestPrice: 1
          }
        }
      ]).toArray();
      return latestPrice[0].latestPrice.toString();
    } catch (e) {
      console.log(e);
    }
  }

  let puppet = new Puppeteer();

  let scanPrices = async (products) => {
    try {

      for (e in products) {
        let scrappedPrice = await puppet.scrapPrice(products[e].url);
        let data = {
          productId: new ObjectID(products[e]._id),
          date: new Date(),
          price: toDecimal(scrappedPrice.price),
          isPromo: scrappedPrice.isPromo,
        };
        const response = await pricesCollection.insertOne({
          productId: data.productId,
          date: data.date,
          price: Decimal128.fromString(data.price),
          isPromo: data.isPromo
        });
        if (response.result.n !== 1 || response.result.ok !== 1) {
          console.log("impossible to create the price");
        }
        const [price] = response.ops;
        console.log('༼ つ ◕_◕ ༽つ ' + e + ': postPrices ok');
        const latestPrice = await getLatestPrice(data.productId);
        if (data.isPromo === true) {
          console.log("Création d'une alerte car en promo ...");
          const alert = await alertsCollection.insertOne({
            productId: data.productId,
            price: Decimal128.fromString(data.price)
          });
        } else if (data.price < latestPrice) {
          console.log("Création d'une alerte car baisse de produit ...");
          const alert = await alertsCollection.insertOne({
            productId: data.productId,
            price: Decimal128.fromString(data.price)
          });
        } else {}

      }
    } catch (e) {
      console.log(e);
    }
  };
  //'1 * * * *'
  cron.schedule('1 * * * *', () => {
    console.log('scan de tous les produits toutes les heures ...');
    scanPrices(productsIdAndUrls);
  });

  app.get('/api/prices', async (req, res) => {
    let prices = await pricesCollection.find().toArray();
    res.json(prices);
  });

  app.get('/api/latestPrice', async (req, res) => {
    try {

      let latestPrice = await pricesCollection.aggregate([
        {
          $match: {
            productId: new ObjectID("60884855a4a9284e7cdec24e")
          }
        }, {
          $group: {
            _id: null,
            latestDocId: {
              $max: '$_id'
            },
            latestPrice: {
              $max: '$price'
            }
          }
        }, {
          $project: {
            _id: 0,
            latestPrice: 1
          }
        }
      ]).toArray();
      console.log(latestPrice.latestPrice);
      res.json(latestPrice)
    } catch (e) {
      console.log(e);
    }
  }
  );

};
