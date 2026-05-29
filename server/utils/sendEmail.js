import nodemailer from "nodemailer";

const hasSmtpConfig = () =>
  process.env.SMTP_HOST && process.env.SMTP_PORT && process.env.SMTP_USER && process.env.SMTP_PASS;

export const sendEmail = async ({ to, subject, html, text }) => {
  if (!hasSmtpConfig()) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SMTP environment variables are not configured.");
    }

    return false;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.MAIL_FROM || "GramBazaar <no-reply@grambazaar.local>",
    to,
    subject,
    html,
    text,
  });

  return true;
};
