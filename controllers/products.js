const { Db, ObjectID, Decimal128 } = require('mongodb');
const jwt = require('jsonwebtoken');

const Puppeteer = require('./puppeteer');

module.exports = (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const productsCollection = db.collection("products");
  const usersCollection = db.collection("users");
  const pricesCollection = db.collection("prices");

  app.get('/api/products', async (req, res) => {
    let products = await productsCollection.find().toArray();
    res.json(products);
  });

  app.get('/api/my-products', async (req, res) => {
    let userId = req.user._id;
    let myTrackedProducts = await usersCollection.aggregate([
      { $match: { _id: new ObjectID(userId) } },
      { $project: { _id: 0, trackedProducts: 1 } },
      { $unwind: '$trackedProducts' },
      { $replaceRoot: { newRoot: '$trackedProducts' } },
      {
        $lookup: {
          from: 'products',
          as: "productLookedUp",
          localField: 'productId',
          foreignField: '_id',
        }
      },
      {
        $lookup: {
          from: 'prices',
          as: "priceLookedUp",
          localField: 'productId',
          foreignField: 'productId',
        }
      },
      {
        $addFields: {
          name: { $arrayElemAt: ['$productLookedUp.name', 0] },
          url: { $arrayElemAt: ['$productLookedUp.url', 0] },
          image: { $arrayElemAt: ['$productLookedUp.image', 0] },
          prices: '$priceLookedUp'
        }
      },
      { $project: { productLookedUp: 0, priceLookedUp: 0, 'prices._id': 0, 'prices.productId': 0 } }
    ]).toArray();
    res.json(myTrackedProducts);
  });

  app.get('/api/my-product/:productId', async (req, res) => {
    let productId = req.params.productId;
    let myProduct = await productsCollection.aggregate([
      { $match: { _id: new ObjectID(productId) } },
      {
        $lookup: {
          from: 'prices',
          as: "priceLookedUp",
          localField: '_id',
          foreignField: 'productId',
        }
      },
      {
        $addFields: {
          prices: '$priceLookedUp'
        }
      },
      { $project: { priceLookedUp: 0, 'prices._id': 0, 'prices.productId': 0 } }
    ]).toArray();
    res.json(myProduct);
  });

  app.post('/api/products', async (req, res) => {
    const _id = req.user._id;
    let data = req.body;
    let url = data.url;
    let priceThreshold;
    try {
      const puppet = new Puppeteer();
      let productScrapped = await puppet.scrapNameAndImage(url);
      const response = await productsCollection.insertOne({
        name: productScrapped.scrappedName,
        url,
        image: productScrapped.scrappedImage
      });
      const [product] = response.ops;
      let isAlertAllowed = data.isAlertAllowed === "true";
      if (data.priceThreshold) {
        priceThreshold = Decimal128.fromString(data.priceThreshold);
        query = { $push: { trackedProducts: { productId: product._id, priceThreshold, isAlertAllowed } } };
      } else {
        priceThreshold = Decimal128.fromString("0.00");
        query = { $push: { trackedProducts: { productId: product._id, isAlertAllowed } } };
      }

      const trackedProductsUpdated = await usersCollection.findOneAndUpdate(
        { _id },
        query,
      );
      if (response.result.n !== 1 || response.result.ok !== 1) {
        return res.status(400).json({ error: "impossible to create the product" });
      }
      res.json(product);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "impossible to create the product" });
    }
  });

  app.put('/api/products/:productId', async (req, res) => {
    const { productId } = req.params;
    const name = req.body;
    const _id = new ObjectID(productId);
    const response = await productsCollection.findOneAndUpdate(
      { _id },
      { $set: name },
      {
        returnOriginal: false,
      },
    );
    if (response.ok !== 1) {
      return res.status(400).json({ error: "impossible to update the product name" });
    }
    res.json(response.value);
  });

  app.delete('/api/products/:productId', async (req, res) => {
    const { productId } = req.params;
    const _id = new ObjectID(productId);
    const productResponse = await productsCollection.findOneAndDelete({ _id });
    if (productResponse.value === null) {
      return res.status(404).send({ error: "produit introuvable, impossible de le supprimer." });
    }
    const pricesResponse = await pricesCollection.deleteMany({ "productId": _id });
    if (pricesResponse.value === null) {
      return res.status(404).send({ error: "aucun prix à supprimer" });
    }
    res.status(204).send();
  });
};
