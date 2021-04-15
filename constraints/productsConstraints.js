module.exports = async (db) => {
  const collectionName = "products";
  const existingCollections = await db.listCollections().toArray();
  if (existingCollections.some(e => e.name === collectionName)) {
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["name", "url", "image"],
        properties: {
          name: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          url: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          image: {
            bsonType: "string",
            description: "must be a string and is required",
          }
        }
      }
    }
  });
};
