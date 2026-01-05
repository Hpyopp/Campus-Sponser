const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const router = express.Router();
const Event = require('../models/campusEvent');
const sendEmail = require('../utils/sendEmail'); // 👈 Email Utility Import kiya

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// 👇 1. GET KEY (YE MISSING THA - 404 ERROR FIX)
router.get('/getkey', (req, res) => {
    res.status(200).json({ key: process.env.RAZORPAY_KEY_ID });
});

// 👇 2. CHECKOUT (Naam badal kar '/checkout' kiya taaki Frontend se match kare)
router.post('/checkout', async (req, res) => {
  try {
    const { amount, eventId } = req.body;
    
    // Check if Event exists & Budget Logic
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: "Event not found" });

    const currentRaised = event.raisedAmount || 0;
    const needed = event.budget - currentRaised;

    // Optional: Agar budget se zyada ho toh rok sakte hain
    // if (amount > needed) {
    //     return res.status(400).json({ message: `Only ₹${needed} needed!` });
    // }

    const options = {
      amount: amount * 100, // razorpay needs paise
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    };

    const order = await razorpay.orders.create(options);
    res.json({ order }); // Frontend expects { order: ... }
  } catch (error) {
    console.error("Order Error:", error);
    res.status(500).send(error);
  }
});

// 👇 3. VERIFICATION (Naam badal kar '/paymentverification' kiya + Email Logic)
router.post('/paymentverification', async (req, res) => {
  try {
    // Frontend URL query params se data aa raha hai, ya body se check kar lena
    // Razorpay callback body mein data bhejta hai
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // URL Query Params se extra data uthana padega kyunki Razorpay direct body mein ye sab nahi bhejta callback par
    // NOTE: Callback URL mein humne eventId, userId bheja tha.
    // Lekin agar tumhara purana code body use kar raha tha, toh hum waisa hi rakhte hain.
    // Assuming Frontend manually verify call kar raha hai:
    
    const { eventId, amount, userId, userName, userEmail, companyName, comment } = req.query; 
    // ^ AGAR callback URL use kar rahe ho toh req.query, agar frontend se post kar rahe ho toh req.body.
    // Safety ke liye dono check karte hain:
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
      
      // Database Update
      const event = await Event.findById(eId);
      if (event) {
        event.sponsors.push({
            sponsorId: userId || req.body.userId,
            name: uName || 'Anonymous',
            email: uEmail,
            companyName: companyName || req.body.companyName || 'Company',
            amount: Number(amt),
            comment: comment || req.body.comment,
            status: 'verified',
            paymentId: razorpay_payment_id,
            date: new Date()
        });
        
        event.raisedAmount = (event.raisedAmount || 0) + Number(amt);
        await event.save();

        // 👇👇 SEND PAYMENT SUCCESS EMAIL 👇👇
        try {
            const subject = "Payment Receipt - CampusSponsor ✅";
            const message = `
              <div style="font-family: Arial; padding: 20px; border: 1px solid #eee;">
                <h2 style="color: #16a34a;">Payment Successful!</h2>
                <p>Hi <b>${uName}</b>,</p>
                <p>We have received your sponsorship of <b>₹${amt}</b>.</p>
                <p><b>Transaction ID:</b> ${razorpay_payment_id}</p>
                <br/>
                <p>Thanks for supporting student events! 🎓</p>
              </div>
            `;
            if(uEmail) await sendEmail({ email: uEmail, subject, html: message });
        } catch (mailError) {
            console.error("Email sending failed but payment success:", mailError);
        }
        // 👆👆 --------------------------- 👆👆

        // Agar frontend 'Callback' mode mein hai toh redirect karo, nahi toh JSON bhejo
        // Hum redirect kar dete hain taaki success page dikhe
        res.redirect(`https://campus-sponser.vercel.app/event/${eId}?payment=success`); 
        // ⚠️ NOTE: Upar apna Frontend URL change kar lena agar localhost hai toh
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