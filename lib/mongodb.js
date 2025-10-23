import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;

if (!uri) {
  throw new Error("MONGODB_URI is not set in environment variables");
}

let cached = global._mongoClientCache;

if (!cached) {
  cached = global._mongoClientCache = { client: null, promise: null };
}

export async function getMongoClient() {
  if (cached.client) return cached.client;

  if (!cached.promise) {
    cached.promise = MongoClient.connect(uri, {
      // MongoDB driver v6 uses stable API; options kept minimal
    }).then((client) => {
      cached.client = client;
      return client;
    });
  }

  return cached.promise;
}

export async function getDb(dbName) {
  const client = await getMongoClient();
  return client.db(dbName);
}


