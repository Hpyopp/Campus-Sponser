const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const Event = require('../models/campusEvent'); // Ensure ye path sahi ho

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. ORDER CREATE KARNA
router.post('/order', async (req, res) => {
  try {
    const options = {
      amount: req.body.amount * 100, // Amount paise mein (100 paise = 1 Rupee)
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Razorpay Error:", error);
    res.status(500).send(error);
  }
});

// 2. PAYMENT VERIFY KARNA & SAVE SPONSOR
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, amount, userId, userName, userEmail, companyName, comment } = req.body;

    // Signature Verification
    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // ✅ Payment Success - Save to DB
      const event = await Event.findById(eventId);
      
      if (event) {
        event.sponsors.push({
            sponsorId: userId,
            name: userName,
            email: userEmail,
            companyName: companyName || 'Company',
            amount: Number(amount),
            comment: comment,
            status: 'verified', // Paid users are directly verified
            paymentId: razorpay_payment_id
        });
        
        // Update Total Raised Amount
        event.raisedAmount = event.sponsors
            .filter(s => s.status === 'verified')
            .reduce((acc, curr) => acc + curr.amount, 0);
        
        await event.save();
        res.json({ message: "Payment Verified & Sponsor Added" });
      } else {
          res.status(404).json({ message: "Event not found" });
      }
    } else {
      res.status(400).json({ message: "Invalid Signature" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;