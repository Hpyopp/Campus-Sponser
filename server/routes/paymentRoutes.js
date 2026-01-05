const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const Event = require('../models/campusEvent');
const sendEmail = require('../utils/sendEmail'); 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 👇 1. GET KEY (Ye Frontend maangta hai)
router.get('/getkey', (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

// 👇 2. CHECKOUT (Naam change kiya: '/order' -> '/checkout')
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
    
    // Frontend expects { order: ... } structure
    res.json({ order }); 
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).send(error);
  }
});

// 👇 3. VERIFICATION (Naam change kiya: '/verify' -> '/paymentverification')
router.post('/paymentverification', async (req, res) => {
  try {
    // Razorpay callback data
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // URL Query se data (kyunki frontend callback URL mein bhej raha hai)
    const { eventId, amount, userId, userName, userEmail, companyName, comment } = req.query; 

    // Safety checks (Agar query se na mile toh body se try kare)
    const eId = eventId || req.body.eventId;
    const amt = amount || req.body.amount;
    const uName = userName || req.body.userName;
    const uEmail = userEmail || req.body.userEmail;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      
      const event = await Event.findById(eId);
      if (event) {
        event.sponsors.push({
            sponsorId: userId,
            name: uName || 'Sponsor',
            email: uEmail,
            companyName: companyName || 'Company',
            amount: Number(amt),
            comment: comment,
            status: 'verified',
            paymentId: razorpay_payment_id,
            date: new Date()
        });
        
        event.raisedAmount = (event.raisedAmount || 0) + Number(amt);
        await event.save();

        // Send Email
        try {
            const subject = "Payment Receipt - CampusSponsor ✅";
            const message = `
              <div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #16a34a;">Payment Successful!</h2>
                <p>Hi <b>${uName}</b>,</p>
                <p>Received: <b>₹${amt}</b></p>
                <p>Transaction ID: ${razorpay_payment_id}</p>
              </div>
            `;
            if(uEmail) await sendEmail({ email: uEmail, subject, html: message });
        } catch (e) { console.log("Email error (ignored):", e.message); }

        // Success Redirect
        // ⚠️ IS URL KO LOCALHOST KAR LENA AGAR LOCAL PE HAI TOH
        // res.redirect(`http://localhost:5173/event/${eId}?payment=success`);
        res.redirect(`https://campus-sponser.vercel.app/event/${eId}?payment=success`); 

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