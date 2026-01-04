import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/api/events/${id}`);
        setEvent(data);
      } catch (error) { toast.error("Event not found"); }
    };
    fetchEvent();
  }, [id]);

  // 👇 RAZORPAY PAYMENT LOGIC
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pay!");
    
    // 1. Fresh Verification Check
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const meRes = await axios.get('/api/users/me', config);
        if (!meRes.data.isVerified) {
            toast.error("🚫 Account Not Verified! Wait for Admin approval.");
            return;
        }
    } catch (err) { return; }

    if (!amount || amount < 1) return toast.error("Enter valid amount");

    setLoading(true);
    
    try {
        // 2. Order Create
        const { data: order } = await axios.post('/api/payment/order', { amount });

        // 3. Razorpay Options
        const options = {
            key: "rzp_test_RzpjqjoYNvSTMY", // 👈 TERA KEY ID (Hardcoded for easy setup)
            amount: order.amount,
            currency: "INR",
            name: "CampusSponsor",
            description: `Sponsorship for ${event.title}`,
            image: "https://cdn-icons-png.flaticon.com/512/476/476863.png",
            order_id: order.id,
            handler: async function (response) {
                // 4. Verify Payment on Backend
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
                    toast.success("🎉 Payment Successful! Agreement Generated.");
                    navigate('/'); 
                } catch (error) {
                    toast.error("Payment Verification Failed");
                }
            },
            prefill: {
                name: user.name,
                email: user.email,
                contact: user.phone
            },
            theme: { color: "#2563eb" }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();

    } catch (error) {
        console.error(error);
        toast.error("Payment Init Failed");
    } finally {
        setLoading(false);
    }
  };

  const shareOnWhatsApp = () => {
      const message = `Check out this amazing event: *${event?.title}* on CampusSponsor! \n\nHelp us make it happen: ${window.location.href}`;
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
  };

  if (!event) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '10px' }}>{event.title}</h1>
        <div style={{ display: 'flex', gap: '15px', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', flexWrap: 'wrap' }}>
            <span>📅 {new Date(event.date).toLocaleDateString()}</span>
            <span>📍 {event.location}</span>
            <span>💰 Budget: ₹{event.budget}</span>
        </div>
        <p style={{ fontSize: '1.1rem', lineHeight: '1.6', color: '#334155', marginBottom: '30px' }}>{event.description}</p>

        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button onClick={shareOnWhatsApp} style={{ flex: 1, padding: '12px', background: '#25D366', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>📲 Share on WhatsApp</button>
            {event.permissionLetter && <a href={event.permissionLetter} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '12px', background: '#3b82f6', color: 'white', borderRadius: '8px', textAlign: 'center', textDecoration: 'none', fontWeight: 'bold' }}>📄 View Permission</a>}
        </div>
      </div>

      {/* PAYMENT FORM */}
      <div style={{ marginTop: '30px', background: '#f8fafc', padding: '30px', borderRadius: '15px', border: '2px dashed #cbd5e1' }}>
        <h2 style={{ textAlign: 'center', color: '#1e293b' }}>💳 Make a Secure Payment</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Payment is secured by Razorpay. Agreement will be generated automatically.</p>
        
        {user?.role === 'sponsor' ? (
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                <textarea placeholder="Message (Optional)" value={comment} onChange={e=>setComment(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', height: '80px' }} />
                
                <button type="submit" disabled={loading} style={{ padding: '15px', background: user.isVerified ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: user.isVerified ? 'pointer' : 'not-allowed' }}>
                    {loading ? 'Processing...' : (user.isVerified ? 'Pay Now & Generate Agreement' : 'Verification Pending 🔒')}
                </button>
                {!user.isVerified && <p style={{color:'#ef4444', textAlign:'center', fontSize:'0.9rem'}}>* You need Admin approval to pay.</p>}
            </form>
        ) : (
            <div style={{ textAlign: 'center', marginTop: '20px', color: '#64748b' }}>
                {user ? "Only Sponsors can pay." : <span onClick={() => navigate('/login')} style={{color:'#2563eb', cursor:'pointer', fontWeight:'bold', textDecoration:'underline'}}>Login as Sponsor to Support</span>}
            </div>
        )}
      </div>
    </div>
  );
};

export default EventDetails;