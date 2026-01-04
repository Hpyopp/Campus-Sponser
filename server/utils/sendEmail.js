const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Credentials Check
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ Credentials Missing");
    throw new Error("Email Credentials Missing");
  }

  // 2. Password Auto-Fix (Spaces Hatao)
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s+/g, '');

  // 3. Transporter Setup (Port 587 - Best for Render)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,              // 👈 Port change kiya (465 hata diya)
    secure: false,          // 👈 587 ke liye ye false hona chahiye
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false // 👈 Ye zaroori hai taaki Render block na ho
    }
  });

  // 4. Send Email
  const mailOptions = {
    from: `"CampusSponsor" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email Sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;