const { Db, ObjectID, Decimal128 } = require('mongodb');
const jwt = require('jsonwebtoken');
const jwtDecode = require('jwt-decode');

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

  app.post('/api/products', async (req, res) => {
    const bearerHeader = req.headers['authorization'];
    const decodedJWT = jwtDecode(bearerHeader);
    const _id = new ObjectID(decodedJWT._id);
    let data = req.body;
    let url = data.url;
    let priceThreshold;
    let isAlertAllowed = data.isAlertAllowed === "true";
    try {
      const puppet = new Puppeteer();
      let productScrapped = await puppet.scrapNameAndImage(url);
      const response = await productsCollection.insertOne({
        name: productScrapped.scrappedName,
        url,
        image: productScrapped.scrappedImage
      });
      const [product] = response.ops;
      if (data.priceThreshold) {
        priceThreshold = Decimal128.fromString(data.priceThreshold);
        query = { $push: { trackedProducts: { productId: product._id, priceThreshold, isAlertAllowed }}};
      } else {
        isAlertAllowed = false;
        query = { $push: { trackedProducts: { productId: product._id, isAlertAllowed }}};
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
