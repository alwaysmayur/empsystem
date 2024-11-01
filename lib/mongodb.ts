// /lib/mongodb.ts

import mongoose from "mongoose";

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) return; // Already connected
  await mongoose.connect(process.env.DATABASE!); // Ensure your MongoDB URI is set
};

export { connectToDatabase };
