import "dotenv/config";
import nodemailer from "nodemailer";

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS);

let transporterSingleton = null;

const getTransporter = () => {
  if (!transporterSingleton) {
    const port = Number(process.env.SMTP_PORT) || 465;
    const isPort465 = port === 465;
    const cleanPass = (process.env.SMTP_PASS || "").trim().replace(/\s+/g, "");

    transporterSingleton = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: isPort465,
      auth: {
        user: (process.env.SMTP_USER || "").trim(),
        pass: cleanPass,
      },
      connectionTimeout: 15000,
      greetingTimeout: 15000,
      socketTimeout: 15000,
    });
  }
  return transporterSingleton;
};

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasSmtpConfig()) {
    console.warn("SMTP environment variables are not configured in server/.env");
    throw new Error("Email service is not configured. Please check SMTP settings in server/.env.");
  }

  const transporter = getTransporter();

  try {
    await transporter.sendMail({
      from: process.env.MAIL_FROM || `GaramBazaar <${process.env.SMTP_USER}>`,
      to,
      subject,
      html,
      text,
    });
    console.log(`Email successfully sent to ${to} (Subject: "${subject}")`);
    return true;
  } catch (error) {
    transporterSingleton = null;
    console.error(`Failed to send email to ${to} (Subject: "${subject}"):`, error.message);
    throw error;
  }
};
