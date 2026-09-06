import bcrypt from "bcryptjs";
import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateToken, COOKIE_OPTIONS } from "../utils/generateToken.js";
import { User } from "../models/User.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import { cloudinaryUpload } from "../utils/cloudinaryUpload.js";
import { Order } from "../models/Order.model.js";
import { Review } from "../models/Review.model.js";
import { Wishlist } from "../models/Wishlist.model.js";
import { SupportTicket } from "../models/SupportTicket.model.js";

export const register = async (req, res) => {
  const email = req.body.email.trim().toLowerCase();
  const existingUser = await User.findOne({ email });

  let user;
  if (existingUser) {
    if (existingUser.isGuest) {
      user = existingUser;
    } else {
      return res.status(409).json(new ApiResponse(false, "User already exists."));
    }
  }

  const passwordHash = await bcrypt.hash(
    req.body.password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12),
  );

  const allowedSelfRoles = ["user", "seller"];
  const requestedRole = req.body.role || "user";
  const role = allowedSelfRoles.includes(requestedRole) ? requestedRole : "user";

  let referredBy = null;
  const refCode = req.body.referredByCode || req.body.referralCode;
  if (refCode) {
    const referrer = await User.findOne({ referralCode: refCode.trim().toUpperCase() });
    if (referrer) {
      referredBy = referrer._id;
    }
  }

  let referralCode = user?.referralCode;
  if (!referralCode) {
    let isUnique = false;
    while (!isUnique) {
      const namePart = req.body.name.trim().replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toUpperCase();
      const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      referralCode = `${namePart}-${randPart}`;
      const check = await User.findOne({ referralCode });
      if (!check) isUnique = true;
    }
  }

  if (user) {
    // Upgrade guest user
    user.name = req.body.name.trim();
    user.passwordHash = passwordHash;
    user.role = role;
    user.isGuest = false;
    user.referralCode = referralCode;
    user.referredBy = referredBy;
    if (req.body.phone) {
      user.phone = req.body.phone.trim();
    }
    await user.save();
  } else {
    // Create new user
    user = await User.create({
      name: req.body.name.trim(),
      email,
      passwordHash,
      role,
      membership: "Silver",
      referralCode,
      referredBy,
      phone: req.body.phone ? req.body.phone.trim() : "",
    });
  }

  // Send email verification on registration
  try {
    const rawToken = crypto.randomBytes(32).toString("hex");
    user.emailVerificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.emailVerificationExpires = Date.now() + 24 * 3600000; // 24 hours
    await user.save();

    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Welcome to GaramBazaar! Verify Your Email Address",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Verify Your Email Address</h2>
          <p style="font-size: 16px; color: #333;">Hello ${user.name || "User"},</p>
          <p style="font-size: 16px; color: #333;">Welcome to GaramBazaar! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #666;">This link is valid for 24 hours.</p>
        </div>
      `,
      text: `Hello ${user.name || "User"}, welcome to GaramBazaar! Verify your email using this link: ${verifyUrl}`,
    });
  } catch (emailErr) {
    console.error("Failed to send welcome verification email during registration:", emailErr.message);
  }

  const token = generateToken(user);
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.status(201).json(
    new ApiResponse(true, "Account created.", {
      user: user.toClient(),
      token,
    }),
  );
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email.trim().toLowerCase() });

  if (!user || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
    return res.status(401).json(new ApiResponse(false, "Invalid email or password."));
  }

  if (user.isActive === false) {
    return res.status(403).json(new ApiResponse(false, "This account has been deactivated. Please contact support."));
  }

  const token = generateToken(user);
  res.cookie("token", token, COOKIE_OPTIONS);

  return res.json(
    new ApiResponse(true, "Login successful.", {
      user: user.toClient(),
      token,
    }),
  );
};

export const me = (req, res) => {
  return res.json(new ApiResponse(true, "Profile loaded.", { user: req.user.toClient() }));
};

export const googleLogin = async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json(new ApiResponse(false, "Google ID Token is required."));
  }

  try {
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${idToken}`);
    if (!response.ok) {
      const errText = await response.text();
      return res.status(400).json(new ApiResponse(false, `Failed to verify Google token: ${errText}`));
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json(new ApiResponse(false, "Google OAuth is not configured on the server."));
    }

    if (payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return res.status(400).json(new ApiResponse(false, "Token audience mismatch."));
    }

    const email = (payload.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json(new ApiResponse(false, "Email not provided in Google account."));
    }

    let name = (payload.name || payload.given_name || "").trim();
    if (!name) {
      name = email.split("@")[0] || "Google User";
    }

    const googleId = payload.sub;
    const avatarUrl = payload.picture;

    let user = await User.findOne({ email });

    if (user) {
      let updated = false;
      if (!user.name) {
        user.name = name;
        updated = true;
      }
      if (role === "seller" && user.role === "user") {
        user.role = "seller";
        updated = true;
      }
      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (!user.avatarUrl && avatarUrl) {
        user.avatarUrl = avatarUrl;
        updated = true;
      }
      if (updated) {
        await user.save();
      }
    } else {
      const allowedRoles = ["user", "seller"];
      const requestedRole = role || "user";
      const finalRole = allowedRoles.includes(requestedRole) ? requestedRole : "user";

      let referredBy = null;
      const refCode = req.body.referredByCode || req.body.referralCode;
      if (refCode) {
        const referrer = await User.findOne({ referralCode: refCode.trim().toUpperCase() });
        if (referrer) {
          referredBy = referrer._id;
        }
      }

      let referralCode;
      let isUnique = false;
      while (!isUnique) {
        const namePart = name.replace(/[^a-zA-Z0-9]/g, "").substring(0, 5).toUpperCase();
        const randPart = Math.random().toString(36).substring(2, 6).toUpperCase();
        referralCode = `${namePart}-${randPart}`;
        const check = await User.findOne({ referralCode });
        if (!check) isUnique = true;
      }

      user = await User.create({
        name,
        email,
        googleId,
        avatarUrl,
        role: finalRole,
        membership: "Silver",
        referralCode,
        referredBy,
      });
    }

    const token = generateToken(user);
    res.cookie("token", token, COOKIE_OPTIONS);

    return res.json(
      new ApiResponse(true, "Google login successful.", {
        user: user.toClient(),
        token,
      }),
    );
  } catch (error) {
    console.error("CRITICAL GOOGLE AUTH ERROR:", error);
    return res.status(500).json(new ApiResponse(false, `Google authentication error: ${error.message}`));
  }
};

export const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  if (name !== undefined) user.name = name.trim();
  if (phone !== undefined) user.phone = phone.trim();

  if (address !== undefined) {
    user.address = {
      line1: address.line1 !== undefined ? address.line1.trim() : user.address?.line1 || "",
      city: address.city !== undefined ? address.city.trim() : user.address?.city || "",
      state: address.state !== undefined ? address.state.trim() : user.address?.state || "",
      pincode: address.pincode !== undefined ? address.pincode.trim() : user.address?.pincode || "",
    };
  }

  await user.save();

  return res.json(
    new ApiResponse(true, "Profile updated successfully.", {
      user: user.toClient(),
    })
  );
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json(new ApiResponse(false, "Email is required."));
  }
  const user = await User.findOne({ email: email.trim().toLowerCase() });
  if (!user) {
    return res.json(new ApiResponse(true, "If that email exists in our records, a reset link has been sent."));
  }
  const rawToken = crypto.randomBytes(32).toString("hex");
  user.passwordResetToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.passwordResetExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const resetUrl = `${clientUrl}/reset-password?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "GaramBazaar Password Reset Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #333;">Hello ${user.name || "User"},</p>
          <p style="font-size: 16px; color: #333;">You requested to reset your password. Please click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 14px; color: #666;">This link is valid for 1 hour. If you did not request this, you can ignore this email safely.</p>
        </div>
      `,
      text: `Hello ${user.name || "User"}, you requested a password reset. Please use the following link to reset your password: ${resetUrl}`,
    });
    return res.json(new ApiResponse(true, "If that email exists in our records, a reset link has been sent."));
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    console.error("Failed to send forgot password email:", err.message);
    return res.status(500).json(new ApiResponse(false, "Could not send password reset email. Please try again later."));
  }
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password) {
    return res.status(400).json(new ApiResponse(false, "Token and new password are required."));
  }
  if (password.length < 8) {
    return res.status(400).json(new ApiResponse(false, "Password must be at least 8 characters."));
  }
  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!user) {
    return res.status(400).json(new ApiResponse(false, "Token is invalid or has expired."));
  }

  user.passwordHash = await bcrypt.hash(
    password,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12)
  );
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  return res.json(new ApiResponse(true, "Password has been reset successfully. You can now log in."));
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json(new ApiResponse(false, "Current password and new password are required."));
  }
  if (newPassword.length < 8) {
    return res.status(400).json(new ApiResponse(false, "New password must be at least 8 characters."));
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  if (user.passwordHash && !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    return res.status(401).json(new ApiResponse(false, "Incorrect current password."));
  }

  user.passwordHash = await bcrypt.hash(
    newPassword,
    Number(process.env.BCRYPT_SALT_ROUNDS || 12)
  );
  await user.save();

  return res.json(new ApiResponse(true, "Password changed successfully."));
};

export const sendEmailVerification = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  if (user.isVerified) {
    return res.status(400).json(new ApiResponse(false, "Email is already verified."));
  }

  const rawToken = crypto.randomBytes(32).toString("hex");
  user.emailVerificationToken = crypto.createHash("sha256").update(rawToken).digest("hex");
  user.emailVerificationExpires = Date.now() + 24 * 3600000; // 24 hours
  await user.save();

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const verifyUrl = `${clientUrl}/verify-email?token=${rawToken}`;

  try {
    await sendEmail({
      to: user.email,
      subject: "GaramBazaar Email Verification Link",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #ea580c; border-bottom: 2px solid #f97316; padding-bottom: 10px;">Verify Your Email Address</h2>
          <p style="font-size: 16px; color: #333;">Hello ${user.name || "User"},</p>
          <p style="font-size: 16px; color: #333;">Welcome to GaramBazaar! Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #ea580c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Verify Email</a>
          </div>
          <p style="font-size: 14px; color: #666;">This link is valid for 24 hours.</p>
        </div>
      `,
      text: `Hello ${user.name || "User"}, welcome to GaramBazaar! Verify your email using this link: ${verifyUrl}`,
    });
    return res.json(new ApiResponse(true, "Verification email sent successfully."));
  } catch (err) {
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    console.error("Failed to send email verification:", err.message);
    return res.status(500).json(new ApiResponse(false, "Could not send verification email. Please try again later."));
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.body;
  if (!token) {
    return res.status(400).json(new ApiResponse(false, "Token is required."));
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json(new ApiResponse(false, "Verification token is invalid or has expired."));
  }

  user.isVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();

  return res.json(new ApiResponse(true, "Email verified successfully! You can now access all features."));
};

export const deleteAccount = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }

  user.isActive = false;
  await user.save();

  res.clearCookie("token", COOKIE_OPTIONS);
  return res.json(new ApiResponse(true, "Your account has been deactivated successfully."));
};

export const uploadAvatar = async (req, res) => {
  if (!req.file) {
    return res.status(400).json(new ApiResponse(false, "No image file provided."));
  }
  const image = await cloudinaryUpload(req.file);
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  user.avatarUrl = image.url;
  await user.save();
  return res.json(new ApiResponse(true, "Avatar updated successfully.", { user: user.toClient() }));
};

export const exportUserData = async (req, res) => {
  const userId = req.user._id;

  const orders = await Order.find({ userId });
  const reviews = await Review.find({ userId });
  const wishlist = await Wishlist.find({ userId });
  const supportTickets = await SupportTicket.find({ userId });

  const exportData = {
    profile: req.user.toClient(),
    registeredAt: req.user.createdAt,
    loyaltyPoints: req.user.loyaltyPoints || 0,
    referralCode: req.user.referralCode || "",
    address: req.user.address || {},
    orders: orders.map(o => o.toClient ? o.toClient() : o),
    reviews: reviews.map(r => r.toClient ? r.toClient() : r),
    wishlist: wishlist.map(w => w.toObject ? w.toObject() : w),
    supportTickets: supportTickets.map(s => s.toClient ? s.toClient() : s),
    exportedAt: new Date().toISOString(),
  };

  res.setHeader("Content-Disposition", `attachment; filename="GaramBazaar_${req.user.name.replace(/\s+/g, "_")}_data.json"`);
  res.setHeader("Content-Type", "application/json");
  return res.send(JSON.stringify(exportData, null, 2));
};

export const getAddresses = async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  return res.json(new ApiResponse(true, "Saved addresses retrieved.", { savedAddresses: user.savedAddresses || [] }));
};

export const addAddress = async (req, res) => {
  const { label, name, phone, line1, city, state, pincode } = req.body;
  if (!name || !phone || !line1 || !city || !state || !pincode) {
    return res.status(400).json(new ApiResponse(false, "All address fields (name, phone, line1, city, state, pincode) are required."));
  }
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  const newAddr = {
    label: label || "Home",
    name,
    phone,
    line1,
    city,
    state,
    pincode
  };
  user.savedAddresses.push(newAddr);
  await user.save();
  return res.status(201).json(new ApiResponse(true, "Address added successfully.", { savedAddresses: user.savedAddresses, address: user.savedAddresses[user.savedAddresses.length - 1] }));
};

export const updateAddress = async (req, res) => {
  const { addressId } = req.params;
  const { label, name, phone, line1, city, state, pincode } = req.body;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  const addr = user.savedAddresses.id(addressId);
  if (!addr) {
    return res.status(404).json(new ApiResponse(false, "Address not found."));
  }
  if (label !== undefined) addr.label = label;
  if (name !== undefined) addr.name = name;
  if (phone !== undefined) addr.phone = phone;
  if (line1 !== undefined) addr.line1 = line1;
  if (city !== undefined) addr.city = city;
  if (state !== undefined) addr.state = state;
  if (pincode !== undefined) addr.pincode = pincode;
  await user.save();
  return res.json(new ApiResponse(true, "Address updated successfully.", { savedAddresses: user.savedAddresses, address: addr }));
};

export const deleteAddress = async (req, res) => {
  const { addressId } = req.params;
  const user = await User.findById(req.user._id);
  if (!user) {
    return res.status(404).json(new ApiResponse(false, "User not found."));
  }
  user.savedAddresses = user.savedAddresses.filter(addr => addr._id.toString() !== addressId.toString());
  await user.save();
  return res.json(new ApiResponse(true, "Address deleted successfully.", { savedAddresses: user.savedAddresses }));
};

export const logout = async (req, res) => {
  res.clearCookie("token", COOKIE_OPTIONS);
  return res.json(new ApiResponse(true, "Logged out successfully."));
};

