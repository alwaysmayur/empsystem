// ./global.d.ts
import { MongoClient } from "mongodb";

declare global {
  var _mongoClientPromise: Promise<MongoClient>; // This must be a var, not a let/const
}
