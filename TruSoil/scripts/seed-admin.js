require("dotenv").config({ path: ".env.local" });
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");

const ADMIN_EMAIL = "admin@trusoil.com";
const ADMIN_PASSWORD = "Admin@1234";
const ADMIN_NAME = "TruSoil Admin";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("❌ MONGODB_URI not set in .env.local");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("✅ Connected to MongoDB");

  const UserSchema = new mongoose.Schema({
    userId: String,
    email: { type: String, unique: true },
    password: String,
    name: String,
    phone: String,
    role: String,
    isActive: Boolean,
    profileComplete: Boolean,
  }, { timestamps: true });

  const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log("⚠️  Admin already exists:", ADMIN_EMAIL);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    userId: `user_${randomUUID()}`,
    email: ADMIN_EMAIL,
    password: hashed,
    name: ADMIN_NAME,
    phone: "0000000000",
    role: "admin",
    isActive: true,
    profileComplete: true,
  });

  console.log("\n🎉 Admin account created!");
  console.log("─────────────────────────────");
  console.log("  Email   :", ADMIN_EMAIL);
  console.log("  Password:", ADMIN_PASSWORD);
  console.log("─────────────────────────────");
  console.log("Login at: http://localhost:3000/auth/login\n");

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
