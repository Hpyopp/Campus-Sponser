import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom'; // ✅ Link Imported
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

  // SMART TIMELINE
  let currentStatus = 'pending';
  if (event.isApproved) {
      currentStatus = 'funding';
      if (event.raisedAmount >= event.budget) currentStatus = 'completed';
  }
  const stages = ['pending', 'funding', 'completed'];
  const currentStep = stages.indexOf(currentStatus);

  // PDF DOWNLOAD
  const downloadAgreement = () => {
    const doc = new jsPDF();
    doc.text("Sponsorship Agreement", 20, 20);
    // (Shortened for brevity, tera purana logic yahan kaam karega)
    doc.save("agreement.pdf");
    toast.success("Downloaded!");
  };

  // PAYMENT HANDLER
  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pay!");
    
    // (Tera purana payment logic yahan aayega)
    // Abhi ke liye short rakha hai taaki code clean rahe
    toast.success("Redirecting to payment..."); 
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

        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '5px' }}>{event.title}</h1>
        
        {/* 👇👇 YE WALA SECTION TERE CODE MEIN MISSING THA 👇👇 */}
        <div style={{ marginBottom: '25px' }}>
            <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Organized by: </span>
            <Link 
                to={`/u/${event.user?._id}`} 
                style={{ color: '#2563eb', fontWeight: 'bold', textDecoration: 'none', fontSize: '1rem', borderBottom: '1px dashed #2563eb' }}
            >
                {event.user?.name || "Unknown Organizer"} 🔗
            </Link>
        </div>
        {/* 👆👆 UPPER WALA SECTION MISSING THA 👆👆 */}

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