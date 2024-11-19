import mongoose from "mongoose";

// Define the interface for the return type
interface IConnectionStatus {
  status: number;
  message: string;
}

async function connectMongoDB(): Promise<IConnectionStatus> {
  try {
    // Take MongoDB database connection string from the environment variable
    const DB = process.env.DATABASE as string;

    if (!DB) {
      throw new Error("MongoDB connection string is not defined in the environment variables.");
    }

    // Connect MongoDB with the DB string
    await mongoose.connect(DB,{
    connectTimeoutMS: 30000,
    socketTimeoutMS: 45000,}); // No need for useNewUrlParser or useUnifiedTopology

    console.log("MongoDB connected successfully..");
    return { status: 200, message: "MongoDB connected successfully.." };
  } catch (error) {
    console.error("connectMongoDB", error);
    return { status: 401, message: "MongoDB Connection Error" };
  }
}

export default connectMongoDB;
