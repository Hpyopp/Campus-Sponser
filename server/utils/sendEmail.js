const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Debugging: Check karo variables load huye ya nahi
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ CRITICAL ERROR: EMAIL_USER or EMAIL_PASS is missing in .env");
    throw new Error("Missing Credentials");
  }

  // 2. Transporter with Explicit SMTP Settings (Port 465)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',  // Gmail ka Server
    port: 465,               // Secure SSL Port (Ye Render par fast chalta hai)
    secure: true,            // Use SSL
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Dhyan rakhna, bina spaces ke hona chahiye
    },
  });

  const mailOptions = {
    from: '"CampusSponsor" <noreply@campussponsor.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<div style="padding: 20px; font-family: sans-serif;">
             <h2>🔐 Verification Code</h2>
             <p>Your OTP is:</p>
             <h1 style="background: #eee; padding: 10px; display: inline-block;">${options.message}</h1>
             <p>Valid for 10 minutes.</p>
           </div>`
  };

  try {
    // 3. Send Email
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent Successfully! Message ID: " + info.messageId);
  } catch (error) {
    console.error("🔥 EMAIL ERROR DETAILS:", error);
    // Error ko throw karo taaki frontend ko pata chale
    throw new Error("Email sending failed. Please check backend logs.");
  }
};

module.exports = sendEmail;