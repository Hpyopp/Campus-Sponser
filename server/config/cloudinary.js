const cloudinary = require('cloudinary').v2; // 👈 Ye .v2 zaroori hai
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

// Config load karo
dotenv.config();

// Debugging: Check karo credentials load hue ya nahi
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error("❌ ERROR: Cloudinary Cloud Name Missing in .env file!");
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus-sponsor-docs', // Folder ka naam Cloudinary par
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
  },
});

module.exports = { cloudinary, storage };