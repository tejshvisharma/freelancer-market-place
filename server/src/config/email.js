import nodemailer from "nodemailer";
import Mailgen from "mailgen";
import { Resend } from "resend";
import dotenv from "dotenv";
dotenv.config();
import ApiError from "./api-error.js";
const isProduction = process.env.NODE_ENV === "production";

// ─── Resend Setup (PRODUCTION) ─────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);

// ─── Nodemailer Setup (DEV) ────────────────────────────────
const transporter = nodemailer.createTransport({
  host: process.env.MAILTRAP_SMTP_HOST,
  port: process.env.MAILTRAP_SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.MAILTRAP_SMTP_USER,
    pass: process.env.MAILTRAP_SMTP_PASS,
  },
});

// ─── Mailgen Setup ─────────────────────────────────────────
const mailGenerator = new Mailgen({
  theme: "default",
  product: {
    name: "SkillSphere",
    link: `http://localhost:${process.env.PORT}/`,
  },
});

// ─── MAIN EMAIL FUNCTION ───────────────────────────────────
const sendEmail = async ({ subject, to, mailGenContent }) => {
  if (!subject || !to || !mailGenContent) {
    throw new Error("Please provide subject, recipient, and mailGenContent");
  }

  // Generate HTML + TEXT
  const emailHtml = mailGenerator.generate(mailGenContent);
  const emailText = mailGenerator.generatePlaintext(mailGenContent);

  try {
    if (isProduction) {
      // ✅ PRODUCTION → Resend
      const { data: res, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM, // MUST be verified domain
        to,
        subject,
        html: emailHtml,
        text: emailText,
      });

      if (error) {
        throw new ApiError(
          500,
          "Failed to send email retry after few minutes.",
        );
      }
    } else {
      // ✅ DEVELOPMENT → Mailtrap
      await transporter.sendMail({
        from: `"SkillSphere" <${process.env.MAILTRAP_SMTP_USER}>`,
        to,
        subject,
        html: emailHtml,
        text: emailText,
      });

      console.log(`✅ Email sent via Mailtrap to ${to}`);
    }
  } catch (err) {
    throw new ApiError(500, "Failed to send email retry after few minutes.");
  }
};

// ─── EMAIL TEMPLATES ───────────────────────────
const forgetPasswordMailGenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: [
        "We received a request to reset your skillshere account password.",
        "If you didn't make this request, you can safely ignore this email.",
      ],
      action: {
        instructions: "To reset your password, click the button below:",
        button: {
          color: "#dc4d2f",
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro: [
        "**If the button doesn't work**, copy and paste this URL into your browser:",
        passwordResetUrl,
        "",
        "This password reset link will expire in 20 minutes for security reasons.",
      ],
    },
  };
};

const emailVerificationMailGenContent = (username, emailVerificationUrl) => {
  return {
    body: {
      name: username,
      intro: ["Welcome to SkillSphere! We're thrilled to have you on board."],
      action: {
        instructions: "To get started, please verify your email address:",
        button: {
          color: "#6e8efb",
          text: "Verify Your Email",
          link: emailVerificationUrl,
        },
      },
      outro: [
        "**If the button doesn't work**, copy and paste this URL into your browser:",
        emailVerificationUrl,
      ],
      signature: false,
    },
    footer: {
      name: "SkillSphere Team",
      subtitle: "Copyright © 2023 SkillSphere. All rights reserved.",
    },
  };
};

export {
  forgetPasswordMailGenContent,
  emailVerificationMailGenContent,
  sendEmail,
};
