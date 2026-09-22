import crypto from "crypto";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Newsletter } from "../models/Newsletter.model.js";
import { sendEmail } from "../utils/sendEmail.js";

/**
 * Generates a secure, tamper-proof HMAC-SHA256 token for an email address.
 */
export const getUnsubscribeToken = (email) => {
  const secret = process.env.JWT_ACCESS_SECRET || "garambazaar_newsletter_secret_key_2026";
  return crypto.createHmac("sha256", secret).update(email.trim().toLowerCase()).digest("hex");
};

/**
 * Validates the HMAC unsubscribe token in constant time.
 */
export const verifyUnsubscribeToken = (email, token) => {
  if (!email || !token) return false;
  const expected = getUnsubscribeToken(email);
  if (expected.length !== token.length) return false;
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(token));
  } catch {
    return false;
  }
};

/**
 * Helper to generate a branded Welcome HTML email.
 */
const buildWelcomeEmailHtml = ({ email, clientUrl, unsubUrl }) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px; color: #1f2937; }
    .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #2c1a0e 0%, #131921 100%); padding: 32px 24px; text-align: center; }
    .logo { color: #f59e0b; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; text-decoration: none; }
    .logo span { color: #ffffff; }
    .content { padding: 32px 24px; line-height: 1.6; font-size: 15px; }
    .headline { font-size: 20px; font-weight: 700; color: #111827; margin-top: 0; margin-bottom: 12px; }
    .coupon-card { background: #fffbeb; border: 2px dashed #f59e0b; border-radius: 12px; padding: 18px; text-align: center; margin: 24px 0; }
    .coupon-title { font-size: 13px; color: #92400e; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
    .coupon-code { font-size: 24px; font-weight: 800; color: #b45309; letter-spacing: 2px; }
    .btn { display: inline-block; background: #c4622d; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 9999px; font-weight: 700; font-size: 14px; margin-top: 16px; }
    .footer { background: #f3f4f6; padding: 20px 24px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
    .footer a { color: #c4622d; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <a href="${clientUrl}" class="logo">🛒 Garam<span>Bazaar</span></a>
      <p style="color: #d1d5db; font-size: 13px; margin: 6px 0 0 0;">Everyday essentials, pure & artisanal.</p>
    </div>
    <div class="content">
      <h2 class="headline">Namaste & Welcome to the Family! 🎉</h2>
      <p>Thank you for subscribing to the GaramBazaar newsletter. You are now first in line to receive handcrafted seasonal harvest updates, artisanal recipe ideas, and exclusive subscriber-only deals.</p>
      
      <div class="coupon-card">
        <div class="coupon-title">Special Welcome Gift: 10% OFF</div>
        <div class="coupon-code">GARAM10</div>
        <div style="font-size: 12px; color: #78350f; margin-top: 4px;">Use at checkout on your next order!</div>
      </div>

      <p>Here is what you can look forward to:</p>
      <ul style="padding-left: 20px; color: #4b5563;">
        <li>🌱 <strong>100% Pure & Organic</strong> farm produce and native staples.</li>
        <li>🚚 <strong>Fast & Free Delivery</strong> across India on orders above ₹500.</li>
        <li>⭐ <strong>Genuine Customer Reviews</strong> and verified farm provenance.</li>
      </ul>

      <div style="text-align: center; margin-top: 28px;">
        <a href="${clientUrl}/shop" class="btn">Explore The Store</a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 8px 0;">You received this email because <strong>${email}</strong> subscribed to updates on GaramBazaar.</p>
      <p style="margin: 0;">Changed your mind? <a href="${unsubUrl}">Click here to Unsubscribe</a> at any time.</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Public: Subscribe to newsletter
 */
export const subscribeNewsletter = async (req, res) => {
  const { email, source } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json(new ApiResponse(false, "Email is required."));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json(new ApiResponse(false, "Please provide a valid email address."));
  }

  const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
  const token = getUnsubscribeToken(normalizedEmail);
  const unsubUrl = `${clientUrl}/unsubscribe?email=${encodeURIComponent(normalizedEmail)}&token=${token}`;

  let subscriber = await Newsletter.findOne({ email: normalizedEmail });
  let isResubscribe = false;

  if (subscriber) {
    if (subscriber.active) {
      return res.status(409).json(new ApiResponse(false, "You are already subscribed to our newsletter!"));
    } else {
      subscriber.active = true;
      subscriber.unsubscribedAt = null;
      if (source) subscriber.source = source;
      await subscriber.save();
      isResubscribe = true;
    }
  } else {
    subscriber = await Newsletter.create({
      email: normalizedEmail,
      active: true,
      source: source || "footer",
    });
  }

  // Send branded welcome email asynchronously without blocking HTTP response
  sendEmail({
    to: normalizedEmail,
    subject: isResubscribe
      ? "Welcome back to GaramBazaar! (Your 10% coupon code)"
      : "Welcome to GaramBazaar! Enjoy 10% OFF your first order 🎁",
    html: buildWelcomeEmailHtml({ email: normalizedEmail, clientUrl, unsubUrl }),
    text: `Namaste!\n\nThank you for subscribing to GaramBazaar. Use coupon code GARAM10 for 10% off your next order.\n\nShop now: ${clientUrl}/shop\n\nTo unsubscribe: ${unsubUrl}`,
  }).catch((err) => {
    console.warn(`[Newsletter] Welcome email to ${normalizedEmail} failed:`, err.message);
  });

  const responseMessage = isResubscribe
    ? "Welcome back! You have been re-subscribed to our newsletter."
    : "Thank you for subscribing! Check your email for a welcome gift.";

  return res.status(isResubscribe ? 200 : 201).json(
    new ApiResponse(true, responseMessage, {
      subscriber: {
        id: subscriber._id,
        email: subscriber.email,
        active: subscriber.active,
      },
    })
  );
};

/**
 * Public: Unsubscribe from newsletter (Supports 1-click token or manual confirmation)
 */
export const unsubscribeNewsletter = async (req, res) => {
  const { email, token } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json(new ApiResponse(false, "Email address is required to unsubscribe."));
  }

  const normalizedEmail = email.trim().toLowerCase();

  // If token is provided, verify it strictly
  if (token && !verifyUnsubscribeToken(normalizedEmail, token)) {
    return res.status(403).json(new ApiResponse(false, "Invalid or expired unsubscribe token."));
  }

  const subscriber = await Newsletter.findOne({ email: normalizedEmail });
  if (!subscriber) {
    return res.status(404).json(new ApiResponse(false, "This email is not subscribed to our newsletter."));
  }

  if (!subscriber.active) {
    return res.json(
      new ApiResponse(true, "This email is already unsubscribed from our newsletter.", {
        email: normalizedEmail,
        active: false,
      })
    );
  }

  subscriber.active = false;
  subscriber.unsubscribedAt = new Date();
  await subscriber.save();

  return res.json(
    new ApiResponse(true, "You have been successfully unsubscribed. We're sad to see you go!", {
      email: normalizedEmail,
      active: false,
      unsubscribedAt: subscriber.unsubscribedAt,
    })
  );
};

/**
 * Public: Verify unsubscribe token and get status
 */
export const verifyUnsubscribeTokenController = async (req, res) => {
  const email = (req.query.email || "").trim().toLowerCase();
  const token = (req.query.token || "").trim();

  if (!email) {
    return res.status(400).json(new ApiResponse(false, "Email parameter is required."));
  }

  const isValidToken = token ? verifyUnsubscribeToken(email, token) : false;
  const subscriber = await Newsletter.findOne({ email });

  return res.json(
    new ApiResponse(true, "Verification complete.", {
      email,
      isValidToken,
      isSubscribed: Boolean(subscriber?.active),
      exists: Boolean(subscriber),
    })
  );
};

/**
 * Admin: Get all subscribers list with filtering and metadata
 */
export const getSubscribers = async (req, res) => {
  const subscribers = await Newsletter.find().sort({ createdAt: -1 });

  const total = subscribers.length;
  const activeCount = subscribers.filter((s) => s.active).length;
  const unsubscribedCount = total - activeCount;

  return res.json(
    new ApiResponse(true, "Subscribers list fetched.", {
      subscribers,
      stats: {
        total,
        activeCount,
        unsubscribedCount,
        optInRate: total > 0 ? Math.round((activeCount / total) * 100) : 0,
      },
    })
  );
};

/**
 * Admin: Toggle subscriber status (Active <-> Inactive)
 */
export const toggleSubscriberStatus = async (req, res) => {
  const { id } = req.params;
  const subscriber = await Newsletter.findById(id);

  if (!subscriber) {
    return res.status(404).json(new ApiResponse(false, "Subscriber not found."));
  }

  subscriber.active = !subscriber.active;
  subscriber.unsubscribedAt = subscriber.active ? null : new Date();
  await subscriber.save();

  return res.json(
    new ApiResponse(
      true,
      `Subscriber ${subscriber.email} marked as ${subscriber.active ? "Active" : "Unsubscribed"}.`,
      { subscriber }
    )
  );
};

/**
 * Admin: Delete subscriber permanently
 */
export const deleteSubscriber = async (req, res) => {
  const { id } = req.params;
  const subscriber = await Newsletter.findByIdAndDelete(id);

  if (!subscriber) {
    return res.status(404).json(new ApiResponse(false, "Subscriber not found."));
  }

  return res.json(
    new ApiResponse(true, `Subscriber ${subscriber.email} permanently removed.`, {
      id,
    })
  );
};

/**
 * Admin: Manually add a subscriber
 */
export const adminAddSubscriber = async (req, res) => {
  const { email } = req.body;
  if (!email || !email.trim()) {
    return res.status(400).json(new ApiResponse(false, "Email address is required."));
  }

  const normalizedEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    return res.status(400).json(new ApiResponse(false, "Invalid email address format."));
  }

  let subscriber = await Newsletter.findOne({ email: normalizedEmail });
  if (subscriber) {
    subscriber.active = true;
    subscriber.unsubscribedAt = null;
    subscriber.source = "admin-manual";
    await subscriber.save();
    return res.json(new ApiResponse(true, `Subscriber ${normalizedEmail} activated.`, { subscriber }));
  }

  subscriber = await Newsletter.create({
    email: normalizedEmail,
    active: true,
    source: "admin-manual",
  });

  return res.status(201).json(
    new ApiResponse(true, `Subscriber ${normalizedEmail} added successfully.`, { subscriber })
  );
};

/**
 * Admin: Send newsletter blast with automated CAN-SPAM compliant unsubscribe footer
 */
export const sendNewsletter = async (req, res) => {
  const { subject, html } = req.body;
  if (!subject || !html) {
    return res.status(400).json(new ApiResponse(false, "Subject and html body are required."));
  }

  try {
    const subscribers = await Newsletter.find({ active: true });
    if (subscribers.length === 0) {
      return res.json(new ApiResponse(true, "No active subscribers found to receive this campaign."));
    }

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").replace(/\/$/, "");
    let successCount = 0;

    for (const sub of subscribers) {
      try {
        const token = getUnsubscribeToken(sub.email);
        const unsubUrl = `${clientUrl}/unsubscribe?email=${encodeURIComponent(sub.email)}&token=${token}`;

        const compliantHtml = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1f2937; line-height: 1.6;">
            ${html}
            <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #6b7280; text-align: center;">
              <p style="margin: 0 0 6px 0;">You received this email because you are an active subscriber of <strong>GaramBazaar</strong>.</p>
              <p style="margin: 0;">Prefer not to receive our newsletters? <a href="${unsubUrl}" style="color: #c4622d; text-decoration: underline; font-weight: 600;">Unsubscribe here</a>.</p>
            </div>
          </div>
        `;

        await sendEmail({
          to: sub.email,
          subject,
          html: compliantHtml,
          text: `${html.replace(/<[^>]*>/g, "")}\n\nUnsubscribe from GaramBazaar: ${unsubUrl}`,
        });
        successCount++;
      } catch (err) {
        console.error(`Failed to send newsletter to ${sub.email}:`, err.message);
      }
    }

    return res.json(
      new ApiResponse(
        true,
        `Newsletter sent successfully to ${successCount} of ${subscribers.length} active subscribers.`
      )
    );
  } catch (err) {
    console.error("sendNewsletter error:", err);
    return res.status(500).json(new ApiResponse(false, err.message || "Failed to send newsletter."));
  }
};
