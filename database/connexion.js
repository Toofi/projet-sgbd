const MongoClient = require('mongodb').MongoClient;
const userConstraints = require('../constraints/usersConstraints');
const pricesConstraints = require('../constraints/pricesConstraints');
const productsConstraints = require('../constraints/productsConstraints');
const alertsConstraints = require('../constraints/alertsConstraints');

const url = "mongodb://localhost:27033";
const dbName = 'quentin';

const getDb = async () => {
  let db;
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db(dbName);
    await userConstraints(db);
    await pricesConstraints(db);
    await productsConstraints(db);
    await alertsConstraints(db);
  } catch (error) {
    console.error(error);
  }
  return db;
};

module.exports = getDb;
