const { Db, ObjectID, Decimal128 } = require('mongodb');
const Puppeteer = require('./puppeteer');

let cron = require('node-cron');
const { priceSchema } = require('./joi');

module.exports = async (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const pricesCollection = db.collection("prices");
  const productsCollection = db.collection("products");
  const alertsCollection = db.collection("alerts");
  const usersCollection = db.collection("users");

  let productsIdAndUrls = await productsCollection.aggregate([{
    $project: { id: 1, url: 1 }
  }]).toArray();
  /**
   * Format the price in the database to avoid spaces and prices symbols like € or $
   * @param {string} price 
   * @returns string
   */
  let toDecimal = (price) => {
    if(!price) {
      return '';
    }
    if (price.includes('€')) {
      return price.replace('€', '').trim().replace(',', '.');
    } else if (price.includes('$')) {
      return price.replace('$', '').trim();
    }
  }

  /**
   * Get the last Price in all the documents related to the product in the MongoDB
   * @param {string} productId - the product Id in Mongodb 
   * @returns string
   */
  let getLatestPrice = async (productId) => {
    try {
      const latestPrice = await pricesCollection.aggregate([
        { $match: { productId: productId } },
        {
          $group: {
            _id: null,
            latestDocId: { $max: '$_id' },
            latestPrice: { $max: '$price' }
          }
        },
        { $project: { _id: 0, latestPrice: 1 } }
      ]).toArray();
      return latestPrice[0].latestPrice.toString();
    } catch (e) {
      console.log(e);
    }
  };

  /**
   * get the threshold price allowed from the user to create and alert
   * @param {string} productId - the product id from the database
   * @returns string
   */
  let getThreshold = async (productId) => {
    try {
      const threshold = await usersCollection.aggregate([
        {
          $match: {
            'trackedProducts.productId': productId
          }
        },
        {
          $unwind: '$trackedProducts'
        },
        {
          $match: {
            'trackedProducts.productId': productId
          }
        },
        {
          $project: { '_id': 0, 'trackedProducts': 1 }
        }
      ]).toArray();
      if (threshold[0].trackedProducts.priceThreshold) {
        threshold[0].trackedProducts.priceThreshold = threshold[0].trackedProducts.priceThreshold.toString();
      }
      return threshold[0].trackedProducts;
    } catch (e) {
      return null;
    }
  };

  let insertAlert = async (productId, price) => {
    try {
      const alert = await alertsCollection.insertOne({
        productId: productId,
        price: Decimal128.fromString(price),
      });
      return alert; 
    } catch (e) {
     console.log(e);
     return null; 
    }
  };

  /**
   * This function checks all the products in the database, scraps their prices and creates alerts for further notifications
   * @param {Array<object>} products - the array of all the products in the database
   */
  let scanPrices = async (products) => {
    let puppet = new Puppeteer();
      for (e in products) {
        try {
          let scrappedPrice = await puppet.scrapPrice(products[e].url);
          if(!scrappedPrice.price) {
            continue;
          }
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
          const threshold = await getThreshold(data.productId);
          if (data.isPromo === true) {
            console.log("Création d'une alerte car en promo ...");
            const alert = insertAlert(data.productId, data.price);
          } else if (data.price < latestPrice) {
            console.log("Création d'une alerte car baisse de produit ...");
            const alert = insertAlert(data.productId, data.price);
          } else if (threshold && threshold.isAlertAllowed === true && data.price < threshold.priceThreshold) {
            console.log("Création d'une alerte car en-dessous du seuil d'alerte ...");
            const alert = insertAlert(data.productId, data.price);
          }
        } catch (e) {
          console.log(e);
        }
      }
      console.log("Fin du scan des prix ...");
  };

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

  app.post('/api/prices', async (req, res) => {
    let data = req.body;
    data.price = toDecimal(data.price);
    data.date = new Date();
    data.isPromo = data.isPromo === "true";
    try {
      const value = await priceSchema.validateAsync({
        objectId: data.productId,
        price: data.price,
        date: data.date,
        isPromo: data.isPromo,
      });
      data.productId = new ObjectID(data.productId);
      data.price = Decimal128.fromString(data.price);
      let postedPrice = await pricesCollection.insertOne({
        productId: data.productId,
        price: data.price,
        date: data.date,
        isPromo: data.isPromo,
      });
      if (postedPrice.result.n !== 1 && postedPrice.result.ok !== 1) {
        return res.status(400).json({ error: "Impossible to create the price" });
      }
      const [price] = postedPrice.ops;
      res.json(price);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "impossible to create the price" });
    }
  });

  app.put('/api/prices/:price', async (req, res) => {
    const _id = new ObjectID(req.params.price);
    let data = req.body;
    data.date = new Date();
    data.isPromo = data.isPromo === "true";
    try {
      const value = await priceSchema.validateAsync({
        objectId: data.productId,
        price: data.price,
        date: data.date,
        isPromo: data.isPromo,
      });
      data.productId = new ObjectID(data.productId);
      data.price = Decimal128.fromString(data.price);
      console.log(data);
      const updatedPrice = await pricesCollection.findOneAndUpdate(
        { _id },
        {
          $set: {
            productId: data.productId,
            price: data.price,
            date: data.date,
            isPromo: data.isPromo,
          }
        },
        {
          returnOriginal: false,
        },
      );
      if (updatedPrice.ok !== 1) {
        return res.status(400).json({ error: "impossible to update the price" });
      }
      res.json(updatedPrice.value);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "Impossible to update the price" });
    }
  });

  app.delete('/api/prices/:price', async (req, res) => {
    const _id = new ObjectID(req.params.price);
    try {
      const priceDeleted = await pricesCollection.findOneAndDelete({ _id });
      if (priceDeleted.value === null) {
        return res.status(404).send({ error: "price not found" });
      }
      res.status(204).send();
    } catch (e) {
      console.log(e);
    }
  });

};
