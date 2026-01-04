const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email Credentials Missing");
  }

  const cleanPassword = process.env.EMAIL_PASS.replace(/\s+/g, '');

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587, // Port 587 Best hai
    secure: false, 
    auth: {
      user: process.env.EMAIL_USER,
      pass: cleanPassword,
    },
    tls: {
      rejectUnauthorized: false
    },
    // 👇 YE HAI MAGIC: 10 Second se zyada wait nahi karega
    connectionTimeout: 10000, 
    greetingTimeout: 10000,
    socketTimeout: 10000
  });

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