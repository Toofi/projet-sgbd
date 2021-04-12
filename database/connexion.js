const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const url = "mongodb://localhost:27017";
const dbName = 'quentin';

const getDb = async () => {
  let db;
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db(dbName);
  } catch (error) {
    console.error(error);
  }
  return db;
};

module.exports = getDb;
