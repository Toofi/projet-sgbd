module.exports = async (db) => {
  const collectionName = "alerts";
  const existingCollections = await db.listCollections().toArray();
  if (existingCollections.some(e => e.name === collectionName)) {
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["productId", "price"],
        properties: {
          productId: {
            bsonType: "objectId",
            description: "must be an objectId and is required",
          },
          price: {
            bsonType: "decimal",
            description: "must be a decimal and is required",
          },
        }
      }
    }
  });
};
