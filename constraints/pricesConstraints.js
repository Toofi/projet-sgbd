module.exports = async (db) => {
  const collectionName = "prices";
  const existingCollections = await db.listCollections().toArray();
  if (existingCollections.some(e => e.name === collectionName)) {
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["productId", "price", "date", "isPromo"],
        properties: {
          productId: {
            bsonType: "objectId",
            description: "must be an objectId and is required",
          },
          price: {
            bsonType: "decimal",
            description: "must be a decimal and is required",
          },
          date: {
            bsonType: "date",
            description: "must be a date and is required",
          },
          isPromo: {
            bsonType: "bool",
            description: "must be a boolean and is required",
          }
        }
      }
    }
  });
};
