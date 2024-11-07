import mongoose from "mongoose";
import { MongoClient } from "mongodb";

const uri = process.env.DATABASE!; // Make sure DATABASE is defined in .env

// Initialize MongoClient once and share it as a Promise
const client = new MongoClient(uri);
const clientPromise: Promise<MongoClient> = client.connect();

// Mongoose connection function
const connectToDatabase = async () => {
  if (mongoose.connection.readyState !== 1) {
    await mongoose.connect(uri);
  }
};

export { connectToDatabase, clientPromise };
