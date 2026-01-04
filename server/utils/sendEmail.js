const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Check Credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ ERROR: Email Credentials Missing in .env");
    throw new Error("Email Credentials Missing");
  }

  // 2. AUTO-FIX PASSWORD (Spaces remove kar raha hu)
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s+/g, '');

  // 3. Transporter (Standard Gmail Settings)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // TLS true hota hai port 587 pe
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword, 
    },
    tls: {
      rejectUnauthorized: false // Server certificate errors ignore karega
    }
  });

  // 4. Email Options
  const mailOptions = {
    from: `"CampusSponsor Team" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html ? options.html : `<div style="font-family: Arial; padding: 20px;"><h3>${options.subject}</h3><p>${options.message}</p></div>`
  };

  // 5. Send
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email Sent to: ${options.email} (ID: ${info.messageId})`);
    return true;
  } catch (error) {
    console.error("🔥 Email Failed:", error);
    // Error throw nahi karenge taaki server crash na ho, bas log karenge
    return false; 
  }
};

module.exports = sendEmail;