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

  // Fetch Event (Live Server se data)
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
  
  let currentStatus = event.isApproved ? (event.raisedAmount >= event.budget ? 'completed' : 'funding') : 'pending';
  const stages = ['pending', 'funding', 'completed'];
  const currentStep = stages.indexOf(currentStatus);

  const handleShare = (platform) => {
    const shareUrl = window.location.href;
    const shareText = `Check out this event: ${event.title} on CampusSponsor! 🚀`;
    let url = platform === 'whatsapp' 
        ? `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + " " + shareUrl)}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const copyLink = () => { navigator.clipboard.writeText(window.location.href); toast.success("Link Copied! 🔗"); };
  
  const downloadAgreement = () => {
    const doc = new jsPDF();
    doc.text(`Agreement for ${event.title}`, 20, 20);
    doc.text(`Sponsor: ${user.name}`, 20, 30);
    doc.text(`Amount: INR ${mySponsorship?.amount}`, 20, 40);
    doc.save("agreement.pdf");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pay!");
    
    setLoading(true);
    toast.success("Connecting..."); 

    try {
        // 1. Get Key from LOCALHOST (127.0.0.1)
        const { data: { key } } = await axios.get("http://127.0.0.1:5000/api/payment/getkey");

        // 2. Create Order
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data: { order } } = await axios.post("http://127.0.0.1:5000/api/payment/checkout", { amount, eventId: event._id }, config);

        // 3. Open Razorpay
        const options = {
            key, amount: order.amount, currency: "INR", name: "CampusSponsor",
            description: `Sponsorship for ${event.title}`, order_id: order.id,
            callback_url: `http://127.0.0.1:5000/api/payment/paymentverification?eventId=${event._id}&userId=${user._id}&amount=${amount}&userName=${user.name}&userEmail=${user.email}`,
            prefill: { name: user.name, email: user.email }, theme: { "color": "#2563eb" }
        };
        const razor = new window.Razorpay(options);
        razor.open();
        setLoading(false);
    } catch (error) {
        console.error("Payment Fail:", error);
        setLoading(false);
        toast.error("Payment Init Failed. Check Console.");
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily:'Poppins' }}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
          {stages.map((s, i) => (
            <div key={s} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: i <= currentStep ? '#3b82f6' : '#e2e8f0', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: i <= currentStep ? 'white' : '#64748b', fontWeight: 'bold' }}>{i + 1}</div>
              <p style={{ fontSize: '0.7rem', marginTop: '8px', color: i <= currentStep ? '#3b82f6' : '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>{s}</p>
            </div>
          ))}
        </div>
        
        {/* Share & Report Buttons */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'flex-end' }}>
            <button onClick={() => handleShare('whatsapp')} style={{ background: '#25D366', border: 'none', padding: '8px 12px', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>WhatsApp 📱</button>
            <button onClick={() => handleShare('linkedin')} style={{ background: '#0077b5', border: 'none', padding: '8px 12px', borderRadius: '5px', color: 'white', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>LinkedIn 💼</button>
            <button onClick={copyLink} style={{ background: '#cbd5e1', border: 'none', padding: '8px 12px', borderRadius: '5px', color: '#1e293b', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }}>Copy Link 🔗</button>
        </div>

        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '5px' }}>{event.title}</h1>
        
        {/* Progress Bar */}
        <div style={{background:'#e2e8f0', borderRadius:'10px', height:'20px', width:'100%', marginBottom:'10px', overflow:'hidden'}}>
            <div style={{width: `${percent}%`, background: isFullyFunded ? '#22c55e' : '#3b82f6', height:'100%', transition:'0.5s'}}></div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', fontSize:'0.9rem', color:'#64748b', marginBottom:'20px'}}>
            <span>Raised: ₹{event.raisedAmount || 0}</span>
            <span>Goal: ₹{event.budget}</span>
        </div>
      </div>

      <div style={{ marginTop: '30px', background: '#f8fafc', padding: '30px', borderRadius: '15px', border: '2px dashed #cbd5e1' }}>
        {mySponsorship ? (
            <div style={{textAlign:'center'}}><h2 style={{color:'#16a34a'}}>✅ You are a Sponsor!</h2><button onClick={downloadAgreement} style={{marginTop:'10px', padding:'10px 20px', background:'#0f172a', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Download Agreement</button></div>
        ) : user?.role === 'sponsor' ? (
            <form onSubmit={handlePayment} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <input type="number" placeholder="Enter Amount (₹)" value={amount} onChange={e=>setAmount(e.target.value)} required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
                <button type="submit" disabled={loading} style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{loading ? 'Processing...' : 'Pay Now'}</button>
            </form>
        ) : (<div style={{ textAlign: 'center', color: '#64748b' }}>Login as Sponsor to Pay.</div>)}
      </div>
    </div>
  );
};
export default EventDetails;