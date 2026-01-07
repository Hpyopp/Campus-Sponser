import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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

  // 👇👇 SMART API URL (Automatic Switch) 👇👇
  // Localhost par ho toh Local Backend, Vercel par ho toh Live Backend
  const API_URL = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  // 1. Fetch Data (Token bhejna zaroori hai taaki Owner check ho sake)
  const fetchEvent = async () => {
    try {
      // 👇 Token header mein bhej rahe hain
      const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
      const { data } = await axios.get(`${API_URL}/api/events/${id}`, config);
      setEvent(data);
    } catch (error) { 
        // Fallback: Agar local DB khali hai toh Live se try karein
        try {
            const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
            const { data } = await axios.get(`https://campus-sponser-api.onrender.com/api/events/${id}`, config);
            setEvent(data);
        } catch(e) { toast.error("Event not found"); }
    }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  if (!event) return <div style={{textAlign:'center', padding:'50px', fontSize:'1.2rem', fontFamily:'Poppins'}}>Loading Event Details... ⏳</div>;

  const mySponsorship = event?.sponsors?.find(s => s.sponsorId === user?._id && s.status === 'verified');
  const isFullyFunded = event?.raisedAmount >= event?.budget;
  const percent = Math.min((event.raisedAmount / event.budget) * 100, 100);

  // --- ACTIONS ---

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Check out this event: ${event.title} on CampusSponsor! 🚀`;
    let url = "";
    if (platform === 'whatsapp') url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    else if (platform === 'linkedin') url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link Copied! 🔗"); };

  const downloadAgreement = () => {
    const doc = new jsPDF();
    doc.setFontSize(20); doc.text("Sponsorship Agreement", 20, 20);
    doc.setFontSize(12);
    doc.text(`Event: ${event.title}`, 20, 40);
    doc.text(`Sponsor: ${user.name}`, 20, 50);
    doc.text(`Amount: INR ${mySponsorship?.amount}`, 20, 60);
    doc.text(`Transaction ID: ${mySponsorship?.paymentId}`, 20, 70);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 80);
    doc.save("Agreement.pdf");
    toast.success("Agreement Downloaded! 📄");
  };

  const handleChat = () => {
    if (!user) { toast.error("Login to chat!"); return navigate('/login'); }
    if (user._id === event.user?._id) return toast.error("You can't chat with yourself!");
    navigate(`/chat?userId=${event.user._id}`);
  };

  const handleReport = async () => {
    if (!user) return toast.error("Login to report!");
    const reason = prompt("Why are you reporting this event? (e.g. Fake, Spam)");
    if (!reason) return;
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post(`${API_URL}/api/reports`, { eventId: event._id, reason }, config);
        toast.success("Report Submitted. Admin will review. 👮‍♂️");
    } catch (error) { toast.error("Failed to submit report"); }
  };

  // 👇👇 PAYMENT LOGIC (SMART URL + REDIRECT FIX) 👇👇
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pay!");
    
    setLoading(true);
    toast.success("Connecting to Payment Gateway... 💳"); 

    try {
        // 1. Get Key
        const { data: { key } } = await axios.get(`${API_URL}/api/payment/getkey`);

        // 2. Create Order
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: { order } } = await axios.post(`${API_URL}/api/payment/checkout`, { amount, eventId: event._id }, config);

        // 👇 Ye line Backend ko batayegi ki wapas kahan aana hai (Local ya Vercel)
        const currentUrl = window.location.origin; 

        // 3. Open Razorpay
        const options = {
            key, amount: order.amount, currency: "INR",
            name: "CampusSponsor", description: `Support ${event.title}`,
            image: "https://cdn-icons-png.flaticon.com/512/4762/4762311.png",
            order_id: order.id,
            // 👇 Callback URL mein client_url bheja hai
            callback_url: `${API_URL}/api/payment/paymentverification?eventId=${event._id}&userId=${user._id}&amount=${amount}&userName=${user.name}&userEmail=${user.email}&client_url=${currentUrl}`,
            prefill: { name: user.name, email: user.email },
            theme: { "color": "#2563eb" }
        };

        const razor = new window.Razorpay(options);
        razor.open();
        setLoading(false);
    } catch (error) {
        console.error("Payment Error:", error);
        setLoading(false);
        toast.error("Payment Failed. Make sure Backend is running.");
    }
  };

  // --- STYLES (Modern Look) ---
  const containerStyle = { maxWidth: '1000px', margin: '40px auto', fontFamily: "'Poppins', sans-serif", padding: '20px', display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '30px' };
  const cardStyle = { background: 'white', borderRadius: '16px', padding: '25px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', marginBottom: '20px' };
  const badgeStyle = { padding: '5px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold', textTransform: 'uppercase', display: 'inline-block' };

  return (
    <div className="event-page" style={containerStyle}>
      
      {/* LEFT COLUMN: Details */}
      <div className="left-col">
        <div style={cardStyle}>
            {/* Header */}
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'15px'}}>
                <span style={{...badgeStyle, background: event.isApproved ? '#dcfce7' : '#fee2e2', color: event.isApproved ? '#166534' : '#991b1b'}}>
                    {event.isApproved ? 'Verified Event ✅' : 'Pending Verification ⏳'}
                </span>

                {/* 👇 VIEWS & DATE SECTION */}
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <span style={{color:'#64748b', fontSize:'0.9rem', display:'flex', alignItems:'center', gap:'5px', background:'#f1f5f9', padding:'4px 10px', borderRadius:'20px'}}>
                        👁️ {event.views || 0} Views
                    </span>
                    <span style={{color:'#64748b', fontSize:'0.9rem'}}>{new Date(event.date).toDateString()} 📅</span>
                </div>
            </div>

            <h1 style={{fontSize:'2.2rem', color:'#1e293b', marginBottom:'15px', lineHeight:'1.2'}}>{event.title}</h1>
            <p style={{color:'#475569', lineHeight:'1.7', fontSize:'1.05rem'}}>{event.description}</p>
            
            <div style={{marginTop:'20px', padding:'15px', background:'#f8fafc', borderRadius:'10px', display:'flex', gap:'20px'}}>
                <div>
                    <span style={{display:'block', fontSize:'0.8rem', color:'#64748b', fontWeight:'bold'}}>LOCATION</span>
                    <span style={{color:'#334155'}}>📍 {event.location}</span>
                </div>
                <div>
                    <span style={{display:'block', fontSize:'0.8rem', color:'#64748b', fontWeight:'bold'}}>BUDGET</span>
                    <span style={{color:'#334155'}}>💰 ₹{event.budget}</span>
                </div>
            </div>
        </div>

        {/* Organizer Section */}
        <div style={{...cardStyle, display:'flex', alignItems:'center', justifyContent:'space-between'}}>
            <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
                <div style={{width:'50px', height:'50px', background:'#3b82f6', borderRadius:'50%', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem', fontWeight:'bold'}}>
                    {event.user?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p style={{margin:0, fontWeight:'bold', color:'#1e293b'}}>{event.user?.name}</p>
                    <Link to={`/u/${event.user?._id}`} style={{fontSize:'0.85rem', color:'#3b82f6', textDecoration:'none'}}>View Profile</Link>
                </div>
            </div>
            {user?._id !== event.user?._id && (
                <button onClick={handleChat} style={{padding:'10px 20px', borderRadius:'30px', border:'1px solid #3b82f6', background:'transparent', color:'#3b82f6', cursor:'pointer', fontWeight:'bold', transition:'0.2s'}}>
                    💬 Chat
                </button>
            )}
        </div>
      </div>

      {/* RIGHT COLUMN: Actions */}
      <div className="right-col">
        
        {/* Progress & Payment Card */}
        <div style={{...cardStyle, borderTop: '5px solid #3b82f6'}}>
            <h3 style={{marginTop:0, color:'#334155'}}>Funding Goal</h3>
            
            {/* Progress Bar */}
            <div style={{background:'#e2e8f0', borderRadius:'10px', height:'12px', width:'100%', margin:'15px 0', overflow:'hidden'}}>
                <div style={{width: `${percent}%`, background: isFullyFunded ? '#22c55e' : '#3b82f6', height:'100%', transition:'1s'}}></div>
            </div>
            <div style={{display:'flex', justifyContent:'space-between', fontWeight:'bold', marginBottom:'20px'}}>
                <span style={{color:'#3b82f6'}}>₹{event.raisedAmount || 0}</span>
                <span style={{color:'#94a3b8'}}>of ₹{event.budget}</span>
            </div>

            {/* Payment Form */}
            {mySponsorship ? (
                <div style={{textAlign:'center', padding:'20px', background:'#f0fdf4', borderRadius:'10px'}}>
                    <h3 style={{color:'#15803d', margin:0}}>🎉 You Sponsored!</h3>
                    <p style={{fontSize:'0.9rem', color:'#166534'}}>Thanks for your support.</p>
                    <button onClick={downloadAgreement} style={{marginTop:'10px', width:'100%', padding:'12px', background:'#15803d', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}>
                        📄 Download Agreement
                    </button>
                </div>
            ) : isFullyFunded ? (
                <div style={{padding:'15px', background:'#dcfce7', color:'#166534', textAlign:'center', borderRadius:'8px', fontWeight:'bold'}}>
                    Target Achieved! 🎯
                </div>
            ) : user?.role === 'sponsor' ? (
                <form onSubmit={handlePayment} style={{display:'flex', flexDirection:'column', gap:'12px'}}>
                    <input 
                        type="number" placeholder="Enter Amount (₹)" 
                        value={amount} onChange={e=>setAmount(e.target.value)} 
                        style={{padding:'12px', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none', fontSize:'1rem'}}
                        required 
                    />
                    <textarea 
                        placeholder="Message for Organizer (Optional)" 
                        value={comment} onChange={e=>setComment(e.target.value)}
                        style={{padding:'12px', borderRadius:'8px', border:'1px solid #cbd5e1', outline:'none', fontSize:'0.9rem', height:'60px'}}
                    />
                    <button type="submit" disabled={loading} style={{padding:'14px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', fontWeight:'bold', fontSize:'1rem', cursor:'pointer', transition:'0.3s'}}>
                        {loading ? 'Processing...' : '💳 Pay Now'}
                    </button>
                </form>
            ) : (
                <p style={{textAlign:'center', color:'#64748b', fontSize:'0.9rem'}}>
                    <Link to="/login" style={{color:'#2563eb', fontWeight:'bold'}}>Login as Sponsor</Link> to contribute.
                </p>
            )}
        </div>

        {/* Share & Report */}
        <div style={cardStyle}>
            <h4 style={{marginTop:0, color:'#475569'}}>Share this Event</h4>
            <div style={{display:'flex', gap:'10px', flexWrap:'wrap'}}>
                <button onClick={() => handleShare('whatsapp')} style={{flex:1, padding:'10px', background:'#25D366', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>WhatsApp</button>
                <button onClick={() => handleShare('linkedin')} style={{flex:1, padding:'10px', background:'#0077b5', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>LinkedIn</button>
            </div>
            <button onClick={copyLink} style={{width:'100%', marginTop:'10px', padding:'10px', background:'#f1f5f9', color:'#334155', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>Copy Link 🔗</button>
            
            <div style={{marginTop:'20px', borderTop:'1px solid #e2e8f0', paddingTop:'15px'}}>
                <button onClick={handleReport} style={{width:'100%', padding:'10px', background:'white', color:'#ef4444', border:'1px solid #ef4444', borderRadius:'5px', cursor:'pointer', fontSize:'0.85rem', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}>
                    🚩 Report Event
                </button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default EventDetails;