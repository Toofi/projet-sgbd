const MongoClient = require('mongodb').MongoClient;
const userConstraints = require('./usersConstraints');

const url = "mongodb://localhost:29740";
const dbName = 'quentin';

const getDb = async () => {
  let db;
  try {
    const client = await MongoClient.connect(url, { useUnifiedTopology: true });
    db = client.db(dbName);
    await userConstraints(db);
  } catch (error) {
    console.error(error);
  }
  return db;
};

module.exports = getDb;
