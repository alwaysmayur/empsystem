import mongoose, { Document, Model } from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";

// Interface for User Document
interface UserDocument extends Document {
  name: string;
  email: string;
  password: string;
  role: string; // Role can include 'admin', 'HR', 'employee', and 'hr'
  mobileNumber: string; // Mobile number of the user
  address: string; // Address of the user
  jobRole: string; // New field for job role
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

// Define the schema for the User
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
    enum: ["admin", "employee", "hr"], // Ensures role is one of these
    default: "employee",
  },
  mobileNumber: {
    type: String,
    required: true,
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
  jobRole: {
    type: String,
    enum: ["food packer", "cashier", "kitchen"], // Job roles allowed
  },
  createdAt: { type: Date, default: Date.now },
});

// Middleware: Hash password before saving the user
userSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// Method: Compare user-entered password with stored hashed password
userSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};

// Define and export the User model
const UserModel: Model<UserDocument> =
  mongoose.models.User || mongoose.model("User", userSchema);

export default UserModel;
