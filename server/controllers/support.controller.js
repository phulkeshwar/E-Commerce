import { SupportTicket } from "../models/SupportTicket.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { sendEmail } from "../utils/sendEmail.js";

export const createSupportTicket = async (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    throw new Error("All fields (name, email, subject, message) are required.");
  }

  const userId = req.user ? req.user._id : null;
  const ticket = await SupportTicket.create({
    userId,
    name: name.trim(),
    email: email.trim(),
    subject: subject.trim(),
    message: message.trim(),
    status: "open"
  });

  const ticketRef = `#TKT-${ticket._id.toString().slice(-6).toUpperCase()}`;
  const adminEmail = process.env.SMTP_USER || "garamsoftwares@gmail.com";
  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

  // Dispatch email notifications asynchronously so response returns fast and gracefully
  Promise.allSettled([
    // 1. Admin Notification Email
    sendEmail({
      to: adminEmail,
      subject: `[Support Desk] New Ticket ${ticketRef}: ${ticket.subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #d97706, #b45309); padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold; letter-spacing: -0.5px;">🛒 GaramBazaar Support Desk</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">New Customer Inquiry Received</p>
          </div>
          <div style="padding: 24px; color: #1f2937;">
            <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; border-radius: 6px; margin-bottom: 20px;">
              <span style="font-weight: bold; color: #92400e;">Ticket Reference:</span> <strong style="color: #78350f; font-size: 16px;">${ticketRef}</strong>
            </div>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
              <tr>
                <td style="padding: 8px 0; color: #6b7280; width: 130px;"><strong>Customer:</strong></td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${ticket.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Email:</strong></td>
                <td style="padding: 8px 0;"><a href="mailto:${ticket.email}" style="color: #d97706; text-decoration: none; font-weight: 600;">${ticket.email}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Subject:</strong></td>
                <td style="padding: 8px 0; color: #111827; font-weight: 600;">${ticket.subject}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #6b7280;"><strong>Received:</strong></td>
                <td style="padding: 8px 0; color: #111827;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            <div style="margin-bottom: 24px;">
              <strong style="display: block; font-size: 13px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 8px;">Customer Message:</strong>
              <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; color: #374151; font-size: 14px; line-height: 1.6; white-space: pre-wrap;">${ticket.message}</div>
            </div>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${clientUrl}/admin" style="background: #d97706; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; display: inline-block;">Open Admin Support Desk →</a>
            </div>
          </div>
          <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            GaramBazaar Automated Notification • &copy; ${new Date().getFullYear()} GaramBazaar
          </div>
        </div>
      `,
      text: `GaramBazaar Support Desk - New Ticket ${ticketRef}\n\nFrom: ${ticket.name} (${ticket.email})\nSubject: ${ticket.subject}\n\nMessage:\n${ticket.message}\n\nOpen Admin Panel: ${clientUrl}/admin`
    }),

    // 2. Customer Confirmation Email
    sendEmail({
      to: ticket.email,
      subject: `We've received your inquiry [${ticketRef}]: ${ticket.subject}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #1e1109, #3a2213); padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">🛒 Garam<span style="color: #f59e0b;">Bazaar</span> Support</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.8; font-size: 14px;">We're on it!</p>
          </div>
          <div style="padding: 24px; color: #1f2937;">
            <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">Namaste <strong>${ticket.name}</strong>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Thank you for contacting GaramBazaar support. We have received your inquiry and our team is already reviewing it. Here is your reference details:</p>
            <div style="background: #fef3c7; border: 1px solid #fde68a; border-radius: 8px; padding: 14px; text-align: center; margin: 20px 0;">
              <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #92400e; display: block;">Ticket Reference ID</span>
              <span style="font-size: 22px; font-weight: 800; color: #b45309; letter-spacing: 1px;">${ticketRef}</span>
            </div>
            <div style="background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: bold; color: #6b7280; text-transform: uppercase;">Inquiry Details:</p>
              <p style="margin: 0 0 6px 0; font-size: 14px; font-weight: 600; color: #111827;">Subject: ${ticket.subject}</p>
              <p style="margin: 0; font-size: 14px; color: #4b5563; line-height: 1.5; white-space: pre-wrap;">${ticket.message}</p>
            </div>
            <p style="font-size: 14px; line-height: 1.6; color: #4b5563;">Our typical response time is within <strong>12 to 24 business hours</strong>. If you have additional information to add, you can simply reply directly to this email.</p>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${clientUrl}" style="background: #ea580c; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; display: inline-block;">Return to GaramBazaar →</a>
            </div>
          </div>
          <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            GaramBazaar Customer Care Desk • &copy; ${new Date().getFullYear()} GaramBazaar
          </div>
        </div>
      `,
      text: `Namaste ${ticket.name},\n\nThank you for reaching out to GaramBazaar Support. We have received your inquiry [${ticketRef}].\n\nSubject: ${ticket.subject}\nMessage:\n${ticket.message}\n\nOur team will review your message and get back to you within 12-24 hours.\n\nGaramBazaar Team`
    })
  ]).catch(err => {
    console.error("Support ticket email dispatch notice:", err);
  });

  res.status(201).json(new ApiResponse(true, `Support inquiry submitted successfully (${ticketRef}). A confirmation email has been dispatched to ${ticket.email}!`, ticket.toClient()));
};

export const getSupportTickets = async (req, res) => {
  const page = Math.max(1, Number(req.query.page || 1));
  const limit = Math.max(1, Number(req.query.limit || 10));
  const skip = (page - 1) * limit;

  const [tickets, totalItems] = await Promise.all([
    SupportTicket.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
    SupportTicket.countDocuments(),
  ]);

  const totalPages = Math.ceil(totalItems / limit);

  res.json(
    new ApiResponse(true, "Support tickets fetched.", {
      tickets: tickets.map(t => t.toClient()),
      pagination: {
        totalItems,
        totalPages,
        currentPage: page,
        limit,
      }
    })
  );
};

export const resolveSupportTicket = async (req, res) => {
  const { id } = req.params;
  const { replyMessage } = req.body || {};
  const ticket = await SupportTicket.findById(id);
  if (!ticket) {
    throw new Error("Support ticket not found.");
  }

  ticket.status = "resolved";
  if (replyMessage?.trim()) {
    ticket.adminReply = replyMessage.trim();
  }
  await ticket.save();

  const ticketRef = `#TKT-${ticket._id.toString().slice(-6).toUpperCase()}`;

  // Notify customer via email that their ticket has been resolved
  try {
    await sendEmail({
      to: ticket.email,
      subject: `Resolved: GaramBazaar Support Ticket ${ticketRef}`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <div style="background: linear-gradient(135deg, #059669, #047857); padding: 24px; text-align: center; color: #ffffff;">
            <h1 style="margin: 0; font-size: 22px; font-weight: bold;">✅ Support Ticket Resolved</h1>
            <p style="margin: 6px 0 0 0; opacity: 0.9; font-size: 14px;">Ticket Reference: ${ticketRef}</p>
          </div>
          <div style="padding: 24px; color: #1f2937;">
            <p style="font-size: 15px; margin-top: 0;">Hello <strong>${ticket.name}</strong>,</p>
            <p style="font-size: 14px; color: #4b5563; line-height: 1.6;">Your support inquiry regarding <strong>"${ticket.subject}"</strong> has been resolved by our customer care team.</p>
            ${ticket.adminReply ? `
              <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 18px 0;">
                <strong style="color: #065f46; display: block; font-size: 13px; text-transform: uppercase; margin-bottom: 6px;">Support Team Response:</strong>
                <p style="margin: 0; color: #047857; font-size: 14px; line-height: 1.5; white-space: pre-wrap;">${ticket.adminReply}</p>
              </div>
            ` : ""}
            <p style="font-size: 14px; color: #6b7280; line-height: 1.6;">If you have any further questions or if there is anything else we can help you with, please feel free to reach out to us again at any time.</p>
            <div style="text-align: center; margin-top: 24px;">
              <a href="${process.env.CLIENT_URL || "http://localhost:5173"}" style="background: #059669; color: #ffffff; text-decoration: none; font-weight: bold; font-size: 14px; padding: 12px 24px; border-radius: 8px; display: inline-block;">Continue Shopping at GaramBazaar →</a>
            </div>
          </div>
          <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 16px; text-align: center; font-size: 12px; color: #9ca3af;">
            GaramBazaar Customer Care Desk • &copy; ${new Date().getFullYear()} GaramBazaar
          </div>
        </div>
      `,
      text: `Hello ${ticket.name},\n\nYour support ticket ${ticketRef} regarding "${ticket.subject}" has been marked as resolved.\n${ticket.adminReply ? `\nSupport Response: ${ticket.adminReply}\n` : ""}\nThank you for shopping with GaramBazaar!`
    });
  } catch (err) {
    console.error("Failed to send ticket resolution email:", err.message);
  }

  res.json(new ApiResponse(true, `Support ticket ${ticketRef} marked as resolved.`, ticket.toClient()));
};
