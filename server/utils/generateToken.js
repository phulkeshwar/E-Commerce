import jwt from "jsonwebtoken";

const getSecret = () => {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("JWT_ACCESS_SECRET must be at least 32 characters.");
  }

  return secret;
};

export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const generateToken = (user) =>
  jwt.sign(
    {
      sub: user._id?.toString?.() || user.id,
      email: user.email,
      role: user.role,
    },
    getSecret(),
    { expiresIn: process.env.JWT_REFRESH_EXPIRES || "7d" }, // Set access token expiry to matching cookie lifespan for simplicity
  );

export const parseToken = (token) => {
  try {
    const payload = jwt.verify(token, getSecret());
    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  } catch {
    return null;
  }
};

