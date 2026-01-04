import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`/api/events/${id}`);
      setEvent(data);
    } catch (error) { toast.error("Event not found"); }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  // Check if current user is already a sponsor
  const mySponsorship = event?.sponsors?.find(s => s.sponsorId === user?._id && s.status === 'verified');
  const isFullyFunded = event?.raisedAmount >= event?.budget;

  // 👇 GENERATE AGREEMENT PDF logic
  const downloadAgreement = () => {
    const doc = new jsPDF();
    doc.setFontSize(22);
    doc.text("Sponsorship Agreement", 20, 20);
    doc.setFontSize(12);
    doc.text(`This agreement is between ${user.companyName} and ${event.user?.name || 'College Representative'}.`, 20, 40);
    doc.text(`Event: ${event.title}`, 20, 50);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 60);
    doc.text(`Sponsorship Amount: INR ${mySponsorship.amount}`, 20, 70);
    doc.text(`Transaction ID: ${mySponsorship.paymentId}`, 20, 80);
    doc.text("------------------------------------------------", 20, 90);
    doc.text("Terms: The sponsor agrees to support the event in exchange for branding.", 20, 100);
    doc.text("Status: PAID & VERIFIED ✅", 20, 120);
    doc.save(`${event.title}_Agreement.pdf`);
    toast.success("Agreement Downloaded!");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pay!");
    
    // Verification Check
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const meRes = await axios.get('/api/users/me', config);
        if (!meRes.data.isVerified) return toast.error("🚫 Not Verified by Admin!");
    } catch (err) { return; }

    if (!amount || amount < 1) return toast.error("Enter valid amount");

    setLoading(true);
    try {
        // Create Order (Sends EventID to check budget)
        const { data: order } = await axios.post('/api/payment/order', { amount, eventId: id });

        const options = {
            key: "rzp_test_RzpjqjoYNvSTMY", // 👈 TERA KEY
            amount: order.amount,
            currency: "INR",
            name: "CampusSponsor",
            description: `Sponsoring ${event.title}`,
            order_id: order.id,
            handler: async function (response) {
                try {
                    const verifyData = {
                        razorpay_order_id: response.razorpay_order_id,
                        razorpay_payment_id: response.razorpay_payment_id,
                        razorpay_signature: response.razorpay_signature,
                        eventId: id,
                        amount: amount,
                        userId: user._id,
                        userName: user.name,
                        userEmail: user.email,
                        companyName: user.companyName,
                        comment: comment
                    };
                    await axios.post('/api/payment/verify', verifyData);
                    toast.success("🎉 Payment Successful!");
                    fetchEvent(); // Refresh data to show Agreement button
                } catch (error) { toast.error("Verification Failed"); }
            },
            prefill: { name: user.name, email: user.email, contact: user.phone },
            theme: { color: "#2563eb" }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    } catch (error) {
        console.error(error);
        toast.error(error.response?.data?.message || "Payment Failed");
    } finally { setLoading(false); }
  };

  if (!event) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  // Progress Calculation
  const percent = Math.min((event.raisedAmount / event.budget) * 100, 100);

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily:'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '10px' }}>{event.title}</h1>
        
        {/* 📊 PROGRESS BAR */}
        <div style={{background:'#e2e8f0', borderRadius:'10px', height:'20px', width:'100%', marginBottom:'10px', overflow:'hidden'}}>
            <div style={{width: `${percent}%`, background: isFullyFunded ? '#22c55e' : '#3b82f6', height:'100%', transition:'0.5s'}}></div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'#64748b', marginBottom:'20px'}}>
            <span>Raised: ₹{event.raisedAmount || 0}</span>
            <span>Goal: ₹{event.budget}</span>
        </div>

        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#334155', marginBottom: '30px' }}>{event.description}</p>
      </div>

      {/* ACTION SECTION */}
      <div style={{ marginTop: '30px', background: '#f8fafc', padding: '30px', borderRadius: '15px', border: '2px dashed #cbd5e1' }}>
        
        {mySponsorship ? (
            // ✅ IF ALREADY PAID -> SHOW AGREEMENT
            <div style={{textAlign:'center'}}>
                <h2 style={{color:'#16a34a'}}>✅ You are a Sponsor!</h2>
                <p style={{color:'#64748b', marginBottom:'20px'}}>Thank you for contributing ₹{mySponsorship.amount}.</p>
                <button onClick={downloadAgreement} style={{padding:'15px 30px', background:'#334155', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}}>
                    📄 Download Agreement
                </button>
            </div>
        ) : isFullyFunded ? (
            // 🔒 IF FULLY FUNDED
            <div style={{textAlign:'center'}}>
                <h2 style={{color:'#22c55e'}}>🎉 Event Fully Funded!</h2>
                <p>No more sponsors needed for this event.</p>
            </div>
        ) : user?.role === 'sponsor' ? (
            // 💳 PAY FORM
            <>
                <h2 style={{ textAlign: 'center', color: '#1e293b' }}>💳 Make Payment</h2>
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Remaining Need: ₹{event.budget - (event.raisedAmount || 0)}</p>
                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <textarea placeholder="Message (Optional)" value={comment} onChange={e=>setComment(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', height: '80px' }} />
                    <button type="submit" disabled={loading} style={{ padding: '15px', background: user.isVerified ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: user.isVerified ? 'pointer' : 'not-allowed' }}>
                        {loading ? 'Processing...' : (user.isVerified ? 'Pay Now & Generate Agreement' : 'Verification Pending 🔒')}
                    </button>
                </form>
            </>
        ) : (
            <div style={{ textAlign: 'center', color: '#64748b' }}>Login as Sponsor to Pay.</div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;