const { response } = require('express');
const { Db, ObjectID } = require('mongodb');
const Puppeteer = require('./puppeteer');

module.exports = async (db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }
  const pricesCollection = db.collection("prices");
  const productsCollection = db.collection("products");

  let productsIdAndUrls = await productsCollection.aggregate([{
    $project: { id: 1, url: 1 }
  }]).toArray();

  let puppet = new Puppeteer();

  let postPrices = async (products) => {
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
        console.log('postPrices ok');
      }
    } catch (e) {
      console.log(e);
    }
  };

  setInterval(() => {
    postPrices(productsIdAndUrls);
    
  }, 10000);

  // let getPrices = async (products) => {
  //   for (product in products){
  //     let price = await puppet.scrapPrice(product.url);
  //     console.log(price);
  //   }
  // };
  // getPrices(products);
};
