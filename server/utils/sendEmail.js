const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  
  // 1. Safety Check: Credentials hain ya nahi?
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ ERROR: EMAIL_USER or EMAIL_PASS missing in .env");
    throw new Error("Server Email Credentials Missing");
  }

  // 2. Transporter Setup (FORCE PORT 465 for Cloud/Render)
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,               // 👈 Magic Port (Blocks nahi hota)
    secure: true,            // 👈 SSL ON (Fast Connection)
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS, // Render par bina space ke daalna
    },
    // 👇 Logs ON kiye hain taaki agar fate toh dikhe kyu fata
    logger: true,
    debug: true, 
  });

  // 3. Email Content
  const mailOptions = {
    from: '"CampusSponsor Team" <noreply@campussponsor.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 10px; text-align: center;">
             <h2 style="color: #2563eb;">🔐 Verification Code</h2>
             <p style="color: #64748b;">Use this code to verify your account:</p>
             <h1 style="background: #eff6ff; color: #1e40af; padding: 15px; display: inline-block; border-radius: 8px; letter-spacing: 8px; border: 2px dashed #3b82f6;">${options.message}</h1>
             <p style="color: #94a3b8; font-size: 0.8rem; margin-top: 20px;">If you didn't request this, ignore this email.</p>
           </div>`
  };

  // 4. Send Function
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email Sent Successfully! Message ID: " + info.messageId);
  } catch (error) {
    console.error("🔥 EMAIL FAILED:", error);
    throw new Error("Email sending failed. Please check backend logs.");
  }
};

module.exports = sendEmail;