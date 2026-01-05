const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const Event = require('../models/campusEvent');
const sendEmail = require('../utils/sendEmail'); 

console.log("💳 Payment Routes Active");

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.get('/getkey', (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

router.post('/checkout', async (req, res) => {
  try {
    const { amount, eventId } = req.body;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const options = {
      amount: amount * 100, 
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };
    const order = await razorpay.orders.create(options);
    res.json({ order }); 
  } catch (error) {
    res.status(500).send(error);
  }
});

router.post('/paymentverification', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    // 👇 Read client_url from query
    const { eventId, amount, userId, userName, userEmail, companyName, comment, client_url } = req.query; 

    // Default to Vercel if missing
    const redirectBase = client_url || "https://campus-sponser.vercel.app";

    const eId = eventId || req.body.eventId;
    const amt = amount || req.body.amount;
    const uName = userName || req.body.userName;
    const uEmail = userEmail || req.body.userEmail;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                               .update(sign.toString()).digest("hex");

    if (razorpay_signature === expectedSign) {
      const event = await Event.findById(eId);
      if (event) {
        event.sponsors.push({
            sponsorId: userId, name: uName, email: uEmail, companyName: companyName,
            amount: Number(amt), comment: comment, status: 'verified',
            paymentId: razorpay_payment_id, date: new Date()
        });
        event.raisedAmount = (event.raisedAmount || 0) + Number(amt);
        await event.save();

        try {
            const subject = "Payment Receipt - CampusSponsor ✅";
            const message = `<p>Hi ${uName}, Received ₹${amt}. Txn ID: ${razorpay_payment_id}</p>`;
            if(uEmail) await sendEmail({ email: uEmail, subject, html: message });
        } catch (e) {}

        // 👇 DYNAMIC REDIRECT (Jahan se aaye the wahin wapas)
        res.redirect(`${redirectBase}/event/${eId}?payment=success`);
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