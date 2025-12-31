const cloudinary = require('cloudinary').v2; // 👈 .v2 zaroori hai
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const dotenv = require('dotenv');

dotenv.config();

// 1. Config Set Karo
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage Engine Banao
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'campus-sponsor-docs',
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
  },
});

module.exports = { cloudinary, storage };