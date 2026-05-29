import bcrypt from "bcryptjs";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateToken } from "../utils/generateToken.js";
import { User } from "../models/User.model.js";

export const register = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    return res.status(409).json(new ApiResponse(false, "User already exists."));
  }

  const passwordHash = await bcrypt.hash(
    req.body.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  );

  const allowedSelfRoles = ["user", "seller"];
  const requestedRole = req.body.role || "user";
  const role = allowedSelfRoles.includes(requestedRole) ? requestedRole : "user";

  const user = await User.create({
    name: req.body.name.trim(),
    email,
    passwordHash,
    role,
    membership: "Silver",
  });

  return res.status(201).json(
    new ApiResponse(true, "Account created.", {
      user: user.toClient(),
      token: generateToken(user),
    }),
  );
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });

  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json(new ApiResponse(false, "Invalid email or password."));
  }

  return res.json(
    new ApiResponse(true, "Login successful.", {
      user: user.toClient(),
      token: generateToken(user),
    }),
  );
};

export const me = (req, res) => {
  return res.json(new ApiResponse(true, "Profile loaded.", { user: req.user.toClient() }));
};
