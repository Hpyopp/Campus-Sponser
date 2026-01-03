const User = require('../models/User');
const mongoose = require('mongoose'); // 👈 Ye Import Zaroori hai
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sendEmail = require('../utils/sendEmail'); 

// ... (Register, OTP, Login functions waise hi rehne de) ...

// 👇 1. UPLOAD DOC (RAW METHOD - Ye Admin ko dikh raha hai matlab ye kaam kar raha hai)
const uploadDoc = asyncHandler(async (req, res) => {
  if (!req.file) { res.status(400); throw new Error('No file uploaded'); }
  
  const fileUrl = req.file.path || req.file.url;
  console.log("🔥 UPLOAD RECEIVED:", fileUrl);

  // Mongoose Schema Bypass karke seedha DB mein likho
  await mongoose.connection.db.collection('users').updateOne(
      { _id: new mongoose.Types.ObjectId(req.user.id) },
      { 
          $set: { 
              verificationDoc: fileUrl, 
              isVerified: false 
          } 
      }
  );

  res.status(200).json({ 
      message: 'Saved Successfully', 
      docUrl: fileUrl, 
      isVerified: false 
  });
});

// 👇 2. GET ME (STEP 2 FIX - REFRESH KA JADOO YAHAN HAI)
const getMe = asyncHandler(async (req, res) => {
  // Hum raw collection se fetch karenge taaki Schema koi field chupaye nahi
  const user = await mongoose.connection.db.collection('users').findOne({ 
      _id: new mongoose.Types.ObjectId(req.user.id) 
  });

  if (user) {
    console.log(`🔍 REFRESH CHECK: Doc in DB is -> ${user.verificationDoc}`); // Terminal check karna
    
    res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        
        // 👇 YE LINE SABSE IMPORTANT HAI
        // Agar ye nahi bheja, toh frontend ko lagega file nahi hai
        verificationDoc: user.verificationDoc || "", 
        
        companyName: user.companyName
    });
  } else {
    res.status(404); throw new Error('User not found');
  }
});

// ... (Baaki functions: unverifyUser, deleteUser wagera same rakho) ...

module.exports = { 
    // ... baaki exports
    uploadDoc, 
    getMe, 
    // ... baaki exports
};