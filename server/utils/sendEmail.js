const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email Credentials Missing in .env");
  }

  // Auto-Fix Password (Spaces Hatao)
  const cleanPassword = process.env.EMAIL_PASS.replace(/\s+/g, '');

  // 👇 PORT CHANGE: 465 (SSL) - Ye Fast Connect Hota Hai
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465, 
    secure: true, // SSL ke liye True
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword, 
    }
  });

  const mailOptions = {
    from: `"CampusSponsor" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // Error ko yahan catch nahi karenge, Controller ko bhejenge
  const info = await transporter.sendMail(mailOptions);
  console.log(`✅ Email Sent: ${info.messageId}`);
  return info;
};

module.exports = sendEmail;