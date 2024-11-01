// /utility/db/mongoDB/schema/userSchema.ts

import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: string; // Role can now include 'hr'
  mobileNumber: string; // New field for mobile number
  address: string; // New field for address
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<UserDocument>({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate(value: string) {
      if (!validator.isEmail(value)) {
        throw new Error("Not a valid email");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
  },
  role: {
    type: String,
    enum: ["admin", "HR", "employee", "hr"], // Updated to include 'hr'
    default: "employee",
  },
  mobileNumber: {
    type: String,
    required: true, // Ensuring this field is required
    validate(value: string) {
      if (!validator.isMobilePhone(value)) {
        throw new Error("Not a valid mobile number");
      }
    },
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
});

// Hash password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string) {
  return await bcrypt.compare(password, this.password);
};

const UserModel: Model<UserDocument> = mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
