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

  const fetchEvent = async () => {
    try {
      const { data } = await axios.get(`https://campus-sponser-api.onrender.com/api/events/${id}`);
      setEvent(data);
    } catch (error) { toast.error("Event not found"); }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  if (!event) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  const mySponsorship = event?.sponsors?.find(s => s.sponsorId === user?._id && s.status === 'verified');
  const isFullyFunded = event?.raisedAmount >= event?.budget;
  const percent = Math.min((event.raisedAmount / event.budget) * 100, 100);

  // Smart Timeline
  let currentStatus = 'pending';
  if (event.isApproved) {
      currentStatus = 'funding';
      if (event.raisedAmount >= event.budget) currentStatus = 'completed';
  }
  const stages = ['pending', 'funding', 'completed'];
  const currentStep = stages.indexOf(currentStatus);

  // SHARE LOGIC
  const shareUrl = window.location.href;
  const shareText = `Check out this event: ${event.title} on CampusSponsor! Need support. 🚀`;

  const handleShare = (platform) => {
    let url = "";
    if (platform === 'whatsapp') {
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`;
    } else if (platform === 'linkedin') {
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    }
    window.open(url, '_blank');
  };

  const copyLink = () => {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link Copied! 🔗");
  };

  // PDF LOGIC
  const downloadAgreement = () => {
    const doc = new jsPDF();
    doc.text("Sponsorship Agreement", 20, 20);
    doc.text(`Event: ${event.title}`, 20, 30);
    doc.text(`Amount: INR ${mySponsorship?.amount}`, 20, 40);
    doc.text(`Transaction ID: ${mySponsorship?.paymentId}`, 20, 50);
    doc.save("agreement.pdf");
    toast.success("Downloaded!");
  };

  // 👇👇 REAL PAYMENT LOGIC RESTORED 👇👇
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pay!");
    
    setLoading(true);
    toast.success("Initiating Payment..."); 

    try {
        // 1. Get Key
        const { data: { key } } = await axios.get("https://campus-sponser-api.onrender.com/api/payment/getkey");

        // 2. Create Order
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: { order } } = await axios.post("https://campus-sponser-api.onrender.com/api/payment/checkout", { amount }, config);

        // 3. Open Razorpay
        const options = {
            key,
            amount: order.amount,
            currency: "INR",
            name: "CampusSponsor",
            description: `Sponsorship for ${event.title}`,
            image: "https://cdn-icons-png.flaticon.com/512/4762/4762311.png",
            order_id: order.id,
            // Callback URL (Backend will verify & send email)
            callback_url: `https://campus-sponser-api.onrender.com/api/payment/paymentverification?eventId=${event._id}&userId=${user._id}&amount=${amount}`,
            prefill: {
                name: user.name,
                email: user.email,
                contact: "9999999999"
            },
            notes: {
                "address": "CampusSponsor Office"
            },
            theme: {
                "color": "#2563eb"
            }
        };

        const razor = new window.Razorpay(options);
        razor.open();
        setLoading(false);

    } catch (error) {
        console.error(error);
        setLoading(false);
        toast.error("Payment Initialization Failed");
    }
  };
  // 👆👆 --------------------------------- 👆👆

  // CHAT BUTTON HANDLER
  const handleChat = () => {
    if (!user) { toast.error("Please login to chat!"); return navigate('/login'); }
    if (user._id === event.user?._id) { return toast.error("You can't chat with yourself!"); }
    navigate(`/chat?userId=${event.user._id}`);
  };

  // REPORT HANDLER
  const handleReport = async () => {
    if (!user) return toast.error("Login to report!");
    const reason = prompt("🚨 Why do you want to report this event? (e.g., Fake Event, Spam)");
    if (!reason) return;

    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        await axios.post('https://campus-sponser-api.onrender.com/api/reports', { eventId: event._id, reason }, config);
        toast.success("Report Submitted to Admin 👮‍♂️");
    } catch (error) {
        toast.error("Failed to submit report");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily:'Poppins' }}>
      
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        
        {/* TIMELINE */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
          {stages.map((s, i) => (
            <div key={s} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: i <= currentStep ? '#3b82f6' : '#e2e8f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: i <= currentStep ? 'white' : '#64748b', fontWeight: 'bold' }}>{i + 1}</div>
              <p style={{ fontSize: '0.7rem', marginTop: '8px', color: i <= currentStep ? '#3b82f6' : '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>{s}</p>
            </div>
          ))}
        </div>

        {/* SHARE BUTTONS */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end' }}>
            <button onClick={() => handleShare('whatsapp')} style={{ background: '#25D366', border: 'none', padding: '8px 12px', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>WhatsApp 📱</button>
            <button onClick={() => handleShare('linkedin')} style={{ background: '#0077b5', border: 'none', padding: '8px 12px', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>LinkedIn 💼</button>
            <button onClick={copyLink} style={{ background: '#cbd5e1', border: 'none', padding: '8px 12px', borderRadius: '5px', color: '#1e293b', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Copy Link 🔗</button>
            <button onClick={handleReport} style={{ background: '#fee2e2', border: '1px solid #ef4444', padding: '8px 12px', borderRadius: '5px', color: '#ef4444', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Report 🚩</button>
        </div>

        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '5px' }}>{event.title}</h1>
        
        {/* ORGANIZER INFO + CHAT BUTTON */}
        <div style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
            <div>
                <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Organized by: </span>
                <Link 
                    to={`/u/${event.user?._id}`} 
                    style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem', borderBottom: '1px dashed #2563eb' }}
                >
                    {event.user?.name || "Unknown Organizer"} 🔗
                </Link>
            </div>

            {user && user._id !== event.user?._id && (
                <button 
                    onClick={handleChat}
                    style={{
                        padding: '6px 15px', background: '#eff6ff', color: '#2563eb', border: '1px solid #2563eb',
                        borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', gap: '6px', transition: '0.2s'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#dbeafe'}
                    onMouseOut={(e) => e.target.style.background = '#eff6ff'}
                >
                    <span>💬</span> Chat with Organizer
                </button>
            )}
        </div>

        {/* PROGRESS BAR */}
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
            <div style={{textAlign:'center'}}>
                <h2 style={{color:'#16a34a'}}>✅ You are a Sponsor!</h2>
                <p>Thanks for supporting.</p>
                <button onClick={downloadAgreement} style={{marginTop:'10px', padding:'10px 20px', background:'#0f172a', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Download Agreement</button>
            </div>
        ) : isFullyFunded ? (
            <div style={{textAlign:'center'}}>
                <h2 style={{color:'#22c55e'}}>🎉 Event Fully Funded!</h2>
            </div>
        ) : user?.role === 'sponsor' ? (
            <>
                <h2 style={{ textAlign: 'center', color: '#1e293b' }}>💳 Make Payment</h2>
                <p style={{ textAlign: 'center', color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>Remaining Need: ₹{event.budget - (event.raisedAmount || 0)}</p>
                <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                    <textarea placeholder="Message" value={comment} onChange={e=>setComment(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', height: '80px' }} />
                    <button type="submit" disabled={loading} style={{ padding: '15px', background: user.isVerified ? '#2563eb' : '#94a3b8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: user.isVerified ? 'pointer' : 'not-allowed' }}>
                        {loading ? 'Processing...' : (user.isVerified ? 'Pay Now' : 'Verify First 🔒')}
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