const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email Credentials Missing");
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 2525, // ✅ Port 2525 (Backup Port)
    secure: false,
    auth: {
      user: process.env.EMAIL_USER, // Ye wo ajeeb ID hi rahega (Login ke liye)
      pass: process.env.EMAIL_PASS, // Ye wo lambi Key hi rahegi
    },
    tls: {
      rejectUnauthorized: false
    },
    family: 4 // IPv4 Force
  });

  const mailOptions = {
    // 👇 YAHAN HAI MAGIC FIX:
    // Humne machine ID hata di, aur tera ASLI email likh diya.
    // Ab user ko mail "CampusSponsor" se aayega, machine se nahi.
    from: `"CampusSponsor" <prathamkhandelwal223@gmail.com>`, 
    to: options.email,
    subject: options.subject,
    html: options.html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email Sent Successfully: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("❌ Email Failed:", error);
    throw error;
  }
};

module.exports = sendEmail;