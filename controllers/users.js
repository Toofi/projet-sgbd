const { json } = require('express');
const { Db, ObjectID } = require('mongodb');
const bcrypt = require('bcrypt');

module.exports = async (app, db) => {
  if (!(db instanceof Db)) {
    throw new Error("Invalid Database");
  }

  const usersCollection = await db.collection('users');

  app.get('/api/users', async (req, res) => {
    try {
      let users = await usersCollection.find().toArray();
      return res.json(users);
    } catch (e) {
      console.log(e);
      return res.status(404).json({ error404: "Aucun utilisateur trouvé" });
    }
  });

  app.post('/api/users', async (req, res) => {
    const data = req.body;
    try {
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
};
