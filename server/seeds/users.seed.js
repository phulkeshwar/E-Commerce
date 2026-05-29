import bcrypt from "bcryptjs";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.model.js";

await connectDB();

const users = [
  {
    name: "Phulkeshwar Mahto",
    email: "phulkeshwar@example.com",
    password: process.env.SEED_USER_PASSWORD,
    role: "user",
    membership: "Gold",
  },
  {
    name: "GramBazaar Admin",
    email: "admin@grambazaar.in",
    password: process.env.SEED_ADMIN_PASSWORD,
    role: "admin",
    membership: "Platinum",
  },
];

for (const user of users) {
  if (!user.password || user.password.length < 8) {
    throw new Error(`Set a strong seed password for ${user.email}.`);
  }

  await User.findOneAndUpdate(
    { email: user.email },
    {
      $set: {
        name: user.name,
        email: user.email,
        passwordHash: await bcrypt.hash(user.password, Number(process.env.BCRYPT_SALT_ROUNDS || 12)),
        role: user.role,
        membership: user.membership,
      },
    },
    { upsert: true, new: true },
  );
}

console.log(`Seeded ${users.length} users.`);
process.exit(0);
