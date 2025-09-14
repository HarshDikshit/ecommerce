import mongoose, { Schema } from "mongoose";

const adminSchema = new Schema(
  {
    username: { type: String, required: true, unique: true }, // Link to Clerk user ID
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const Admin = mongoose.models.User || mongoose.model("User", adminSchema);
export default Admin;
