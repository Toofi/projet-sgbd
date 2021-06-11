const MongoClient = require('mongodb').MongoClient;
const userConstraints = require('../constraints/usersConstraints');
const pricesConstraints = require('../constraints/pricesConstraints');
const productsConstraints = require('../constraints/productsConstraints');
const alertsConstraints = require('../constraints/alertsConstraints');

// let tunnel = require('tunnel-ssh');

// var config = {
//   username: 'ecole',
//   password: 'ecole2021',
//   host: '135.125.95.178',
//   port: 22,
//   dstHost: 'localhost',
//   dstPort: 27017,
//   localHost: '127.0.0.1',
//   localPort: 27033
// };

const url = "mongodb://135.125.95.178:27017";
const dbName = 'quentin';

const getDb = async () => {
  // tunnel(config, function (error, server) {  });
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
