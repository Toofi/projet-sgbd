const { Db, ObjectID } = require('mongodb');

const Puppeteer = require('./puppeteer');

module.exports = (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const productsCollection = db.collection("products");

  app.get('/api/products', async (req, res) => {
    let products = await productsCollection.find().toArray();
    res.json(products);
  });

  app.post('/api/products', async (req, res) => {
    let url = req.body;
    try {
      console.log(url.url);
      const puppet = new Puppeteer();
      let productScrapped = await puppet.scrapNameAndImage(url.url);
      console.log(productScrapped);
      const response = await productsCollection.insertOne({
        name: productScrapped.scrappedName,
        url: url.url,
        image: productScrapped.scrappedImage
      });
      if (response.result.n !== 1 || response.result.ok !== 1) {
        return res.status(400).json({ error: "impossible to create the product" });
      }
      const [product] = response.ops;
      res.json(product);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "impossible to create the product" });
    }
  });

};
