const { json } = require('express');
const { Db, ObjectID, Decimal128 } = require('mongodb');
const bcrypt = require('bcrypt');
const passport = require('passport');
const jwt = require('jsonwebtoken');
const { userSchema } = require('./joi');

module.exports = async (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }

  const usersCollection = await db.collection('users');

  app.post('/login', async (req, res) => {
    passport.authenticate('local', { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(400).json({
          message: "something is not right",
          user: user
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          return res.send(err);
        }
        delete user.password;
        const token = jwt.sign(user, "maSignature");
        return res.json({ user, token });
      });
    })(req, res);

  });

  app.get('/api/user', async (req, res) => {
    const _id = req.user._id;
    try {
      let user = await usersCollection.findOne(_id);
      if (user === null) {
        res.status(404).send({ error: "Utilisateur inexistant" });
      }

      res.json(user);
    } catch (e) {
      console.log(e);
    }
  });

  app.get('/api/users', async (req, res) => {
    try {
      let users = await usersCollection.find().toArray();
      return res.json(users);
    } catch (e) {
      console.log(e);
      return res.status(404).json({ error404: "Aucun utilisateur trouvé" });
    }
  });

  app.post('/users', async (req, res) => {
    const data = req.body;
    try {
      const value = await userSchema.validateAsync({ 
        username: data.username, 
        firstName: data.firstName,
        lastName: data.lastName,
        emails: data.emails,
        password: data.password,
      });
      data.password = bcrypt.hashSync(data.password, 10);
      const response = await usersCollection.insertOne(data);
      if (response.result.n !== 1 && response.result.ok !== 1) {
        return res.status(400).json({ error: "Impossible to create the user" });
      }
      const [user] = response.ops;
      delete user.password;
      res.json(user);
    } catch (e) {
      console.log(e);
      return res.status(400).json({ error: "impossible to create the user" });
    }
  });

  app.put('/api/users', async (req, res) => {
    const _id = req.user._id;
    const data = req.body;
    try {
      const value = await userSchema.validateAsync({ 
        username: data.username, 
        firstName: data.firstName,
        lastName: data.lastName,
        emails: data.emails,
        password: data.password,
      });
      if (data.password) {
        data.password = bcrypt.hashSync(data.password, 10);
      }
      const response = await usersCollection.findOneAndUpdate(
        { _id: new ObjectID(_id) },
        { $set: data },
        {
          returnOriginal: false,
        },
      );
      console.log(response);
      if (response.ok !== 1) {
        return res.status(400).json({ error: "impossible to update the product name" });
      }
      res.json(response.value);
    } catch (e) {
      console.log(e);
    }
  });

  app.put('/api/users/:productId', async (req, res) => {
    const _id = req.user._id;
    const data = req.body;
    if (data.isAlertAllowed) {
      data.isAlertAllowed = data.isAlertAllowed === "true";
    }
    const productId = req.params.productId;
    let query;
    if (!data.priceThreshold) {
      query = { 'trackedProducts.$.isAlertAllowed': data.isAlertAllowed };
    } else if (!data.isAlertAllowed) {
      query = { 'trackedProducts.$.priceThreshold': Decimal128.fromString(data.priceThreshold) };
    } else {
      query = {
        'trackedProducts.$.priceThreshold': Decimal128.fromString(data.priceThreshold),
        'trackedProducts.$.isAlertAllowed': data.isAlertAllowed
      }
    }
    try {
      const response = await usersCollection.findOneAndUpdate(
        {
          _id: new ObjectID(_id),
          'trackedProducts.productId': new ObjectID(productId)
        },
        {
          $set: query
        },
        {
          returnOriginal: false,
        }
      );
      res.json(response);
    } catch (e) {
      console.log(e);
    }
  });
};
