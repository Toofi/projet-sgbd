const { Db, ObjectID, Decimal128 } = require('mongodb');

const { alertSchema } = require('./joi');

module.exports = async (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }

  const alertsCollection = db.collection("alerts");

  app.get('/api/alerts', async (req, res) => {
    try {
      const alerts = await alertsCollection.find().toArray();
      res.json(alerts);
    } catch (e) {
      console.log(e);
    }
  });

  app.get('/api/alerts/:alertId', async (req, res) => {
    const _id = new ObjectID(req.params.alertId);
    try {
      const alert = await alertsCollection.findOne({ _id });
      if (alert === null) {
        return res.statuts(404).send({ error: "Impossible to find this alert" });
      }
      res.json(alert);
    } catch (e) {
      console.log(e);
    }
  })

  app.post('/api/alerts', async (req, res) => {
    console.log(req.body.productId);
    const productId = new ObjectID(req.body.productId);
    const price = Decimal128.fromString(req.body.price);
    try {
      const value = await alertSchema.validateAsync({ objectId: req.body.productId, price: req.body.price });
      let newAlert = await alertsCollection.insertOne({
        productId,
        price
      });
      if (newAlert.result.ok !== 1) {
        return res.status(400).json({ error: "Impossible to post the alert" });
      }
      const [alert] = newAlert.ops;
      res.json(alert);
    }
    catch (e) {
      res.status(400).send({ error: e });
      console.log(e);
    }
  });

  app.put('/api/alerts/:alertId', async (req, res) => {
    const _id = new ObjectID(req.params.alertId);
    const data = {};
    try {
      const value = await alertSchema.validateAsync({
        objectId: req.params.alertId,
        objectId: req.body.productId,
        price: req.body.price
      });
      data.productId = new ObjectID(req.body.productId);
      data.price = Decimal128.fromString(req.body.price);
      const alertUpdated = await alertsCollection.findOneAndUpdate(
        { _id },
        { $set: data },
        {
          returnOriginal: false,
        },
      );
      console.log(alertUpdated);
      res.json(alertUpdated.value);
    } catch (e) {
      res.status(400).json({ error: "" });
      console.log(e);
    }
  });

  app.delete('/api/alerts/:alertId', async (req, res) => {
    const _id = new ObjectID(req.params.alertId);
    try {
      const alertRemoved = await alertsCollection.findOneAndDelete({ _id });
      if (alertRemoved.value === null) {
        return res.status(404).send({ error: "impossible to remove this alert" });
      }
      res.status(204).send();
    } catch (e) {
      console.log(e);
    }
  });
}
