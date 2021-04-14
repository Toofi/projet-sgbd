module.exports = async (db) => {
  const collectionName = "users";
  const existingCollections = await db.listCollections().toArray();
  if (existingCollections.some(e => e.name === collectionName)) {
    return;
  }

  await db.createCollection(collectionName, {
    validator: {
      $jsonSchema: {
        bsonType: "object",
        required: ["nickName", "firstName", "lastName", "emails", "password", "created"],
        properties: {
          nickName: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          firstName: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          lastName: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          emails: {
            bsonType: "array",
            description: "must be a string and is required",
            items: {
              bsonType: "string",
            }
          },
          password: {
            bsonType: "string",
            description: "must be a string and is required",
          },
          trackedProducts: {
            bsonType: "array",
            items: {
              bsonType: "objectId",
              required: ["productId"],
              properties: {
                productId: {
                  bsonType: "string",
                  description: "must be an objectId and is required",
                },
                priceThreshold: {
                  bsonType: "decimal",
                  description: "must be a decimal and isn't required"
                }
              }
            }
          },
          created: {
            bsonType: "timestamp",
            description: "must be a timestamp and is required"
          }
        }
      }
    }
  });
};
