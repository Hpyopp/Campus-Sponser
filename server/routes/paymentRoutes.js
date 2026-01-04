const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const Event = require('../models/campusEvent');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 1. ORDER CREATE (With Budget Check)
router.post('/order', async (req, res) => {
  try {
    const { amount, eventId } = req.body;
    
    // Check if Event exists & Budget Logic
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const currentRaised = event.raisedAmount || 0;
    const needed = event.budget - currentRaised;

    if (amount > needed) {
        return res.status(400).json({ message: `Only ₹${needed} needed! You entered too much.` });
    }

    const options = {
      amount: amount * 100, // razorpay needs paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).send(error);
  }
});

// 2. VERIFY & SAVE (Update Raised Amount)
router.post('/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, amount, userId, userName, userEmail, companyName, comment } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      const event = await Event.findById(eventId);
      if (event) {
        // Add Sponsor
        event.sponsors.push({
            sponsorId: userId,
            name: userName,
            email: userEmail,
            companyName: companyName || 'Company',
            amount: Number(amount),
            comment: comment,
            status: 'verified', // ✅ Paid = Verified
            paymentId: razorpay_payment_id,
            date: new Date()
        });
        
        // Update Total Logic
        event.raisedAmount = (event.raisedAmount || 0) + Number(amount);
        
        await event.save();
        res.json({ message: "Success" });
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