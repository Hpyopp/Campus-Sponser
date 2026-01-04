const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Credentials Validation
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ ERROR: Email Credentials Missing in .env");
    throw new Error("Email Credentials Missing");
  }

  // 2. Auto-Fix Password (Spaces Hatao Logic)
  // Ye line tere 'ksgl rilw...' ko 'ksglrilw...' bana degi automatically
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s+/g, '');

  // 3. Transporter Setup (Standard Gmail Settings)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587, // Port 587 is best for TLS
    secure: false, // TLS ke liye false rakhte hain
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword, // 👈 Clean Password Use Hoga
    },
    tls: {
      rejectUnauthorized: false // Server certificate issues ko ignore karega
    }
  });

  // 4. Email Template
  const mailOptions = {
    from: `"CampusSponsor Team" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html ? options.html : `<div style="font-family: Arial, sans-serif; padding: 20px;"><h3>${options.subject}</h3><p>${options.message}</p></div>`
  };

  // 5. Send Email
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email Sent Successfully to: ${options.email} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error("🔥 Email Failed:", error);
    throw new Error(error.message);
  }
};

module.exports = sendEmail;