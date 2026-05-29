import { User } from "../models/User.model.js";
import { parseToken } from "../utils/generateToken.js";

export const requireAuth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const tokenUser = parseToken(token);

  if (!tokenUser?.id) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  const user = await User.findById(tokenUser.id);

  if (!user) {
    return res.status(401).json({ success: false, message: "Authentication required." });
  }

  req.user = user;
  next();
};
