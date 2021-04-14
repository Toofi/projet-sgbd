const MongoClient = require('mongodb').MongoClient;
const userConstraints = require('./usersConstraints');
const pricesConstraints = require('./pricesConstraints');
const productsConstraints = require('./productsConstraints');
const alertsConstraints = require('./alertsConstraints');

const url = "mongodb://localhost:29203";
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
