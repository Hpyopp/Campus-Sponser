const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1. Check Credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ Error: Email Credentials Missing");
    throw new Error("Email Credentials Missing");
  }

  // 2. Transporter Setup (BREVO with Backup Port 2525)
  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com', 
    port: 2525,              // 👈 MAGIC FIX: 587 ki jagah 2525 use kar rahe hain
    secure: false,           // Port 2525 ke liye false hi rehta hai
    auth: {
      user: process.env.EMAIL_USER, // Render Env se Login lega
      pass: process.env.EMAIL_PASS, // Render Env se Key lega
    },
    tls: {
      rejectUnauthorized: false // Certificate errors ignore karega
    },
    family: 4 // 👈 IPv4 Force kiya taaki connection fast ho
  });

  // 3. Email Details
  const mailOptions = {
    // "From" mein apna asli naam dikhana taaki user confuse na ho
    from: `"CampusSponsor" <${process.env.EMAIL_USER}>`, 
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  // 4. Send with Error Logging
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Brevo Email Sent Successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Brevo Connection Failed:", error);
    throw error; // Error frontend ko bhejo taaki pata chale
  }
};

module.exports = sendEmail;