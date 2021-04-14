const { response } = require('express');
const { Db, ObjectID, Timestamp } = require('mongodb');

module.exports = (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const productsCollection = db.collection("products");

  app.post('/api/products', async (req, res) => {
    const data = req.body;
    try {
      const response = await productsCollection.insertOne(data);
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
