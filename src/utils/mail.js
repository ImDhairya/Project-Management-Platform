import Mailgen from "mailgen";
import nodemailer from "nodemailer";

export const sendEmail = async (options) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagerlink.com",
    },
  });

  const emailTextualContent = mailGenerator.generatePlaintext(
    options.mailgenContent,
  );

  const emailHtmlContent = mailGenerator.generate(options.mailgenContent);

  const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMTP_HOST,
    port: process.env.MAILTRAP_SMTP_PORT,
    auth: {
      user: process.env.MAILTRAP_SMTP_USER,
      pass: process.env.MAILTRAP_SMTP_PASS,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailTextualContent,
    html: emailHtmlContent,
  };

  try {
    await transporter.sendMail(mail);
  } catch (error) {
    console.error(error);
    throw new Error(error, "Failed to send mail.");
  }
};

const emailVerificationMailgenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: "Welcome to the app",
      action: {
        instructions: "To verify click the button.",

        button: {
          color: "#1aae5aff",
          text: "Verify email.",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just repyly to this email, we'd love to help.",
    },
  };
};

const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: "Forgot password",
      action: {
        instructions: "To verify click the button.",

        button: {
          color: "#1aae5aff",
          text: "Forgot password.",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just repyly to this email, we'd love to help.",
    },
  };
};

export { emailVerificationMailgenContent, forgotPasswordMailgenContent };
