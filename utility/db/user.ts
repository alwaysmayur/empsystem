// utility/db/user.ts
import UserModel from "@/utility/db/mongoDB/schema/userSchema"; // Your User model

export const getUserByEmail = async (email: string) => {
  try {
    const user = await UserModel.findOne({ email }).exec(); // Assuming you're using Mongoose
    return user; // Returns user document or null
  } catch (error) {
    console.error("Error fetching user by email:", error);
    return null; // Handle error appropriately
  }
};
