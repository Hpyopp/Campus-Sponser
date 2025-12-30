const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.dkdrwv5uv,
  api_key: process.env.459644871583315,
  api_secret: process.env.yyiCynuFOMX0yoCTZJTrCUygQpg,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'campus-sponsor-events', // Cloudinary pe folder ka naam
    allowedFormats: ['jpeg', 'png', 'jpg'],
  },
});

module.exports = { cloudinary, storage };