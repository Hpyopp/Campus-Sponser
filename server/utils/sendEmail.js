const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // Tera Gmail
      pass: process.env.EMAIL_PASS, // Wo 16-digit App Password
    },
  });

  const mailOptions = {
    from: '"CampusSponsor Security" <noreply@campussponsor.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: `<h1>${options.message}</h1>` // Thoda bold dikhega
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;