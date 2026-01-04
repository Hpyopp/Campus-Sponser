const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Credentials Check
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ ERROR: Email Credentials Missing in .env");
    return;
  }

  // 2. Transporter Setup (Gmail Secure Port 465)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // SSL True
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // 3. Email Content (Smart Logic)
  // Agar HTML message aaya hai toh wo use karega (Admin actions ke liye)
  // Agar plain text hai toh wo use karega (OTP ke liye)
  const mailOptions = {
    from: '"CampusSponsor Team" <noreply@campussponsor.com>',
    to: options.email,
    subject: options.subject,
    html: options.html ? options.html : `<div style="font-family: Arial, sans-serif; padding: 20px;"><h3>Message:</h3><p>${options.message}</p></div>`
  };

  // 4. Send
  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email Sent to: ${options.email}`);
  } catch (error) {
    console.error("🔥 Email Failed:", error.message);
    // Error aane par server crash nahi karega
  }
};

module.exports = sendEmail;