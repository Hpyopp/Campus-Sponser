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
      const { data } = await axios.get(`https://campus-sponser-api.onrender.com/api/events/${id}`);
      setEvent(data);
    } catch (error) { toast.error("Event not found"); }
  };

  useEffect(() => { fetchEvent(); }, [id]);

  if (!event) return <div style={{textAlign:'center', marginTop:'50px'}}>Loading...</div>;

  const mySponsorship = event?.sponsors?.find(s => s.sponsorId === user?._id && s.status === 'verified');
  const isFullyFunded = event?.raisedAmount >= event?.budget;
  const percent = Math.min((event.raisedAmount / event.budget) * 100, 100);

  // 👇 SMART TIMELINE LOGIC (Fix for Stuck Pending)
  // Hum database status ke bajaye real conditions check karenge
  let currentStatus = 'pending';
  
  if (event.isApproved) {
      currentStatus = 'funding'; // Agar Approved hai toh kam se kam Funding stage pe hai
      if (event.raisedAmount >= event.budget) {
          currentStatus = 'completed'; // Agar paisa pura ho gaya toh Completed
      }
  }

  const stages = ['pending', 'funding', 'completed'];
  const currentStep = stages.indexOf(currentStatus);

  // 👇 PDF DOWNLOAD LOGIC
  const downloadAgreement = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;

    // HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(41, 128, 185);
    doc.text("SPONSORSHIP AGREEMENT", pageWidth / 2, 25, { align: "center" });
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    const refId = mySponsorship.paymentId ? mySponsorship.paymentId.slice(-8).toUpperCase() : 'GEN-001';
    doc.text(`Agreement Ref: CSP-${refId}`, 150, 15);

    doc.setLineWidth(0.8);
    doc.setDrawColor(41, 128, 185);
    doc.line(20, 32, 190, 32);

    // PARTIES
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(`This Agreement is executed on ${new Date().toLocaleDateString()} between:`, 20, 50);

    doc.setFont("helvetica", "bold");
    doc.text("THE SPONSOR (PAYER)", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`${mySponsorship.companyName || user.companyName || user.name}`, 20, 72);
    doc.text(`Email: ${user.email}`, 20, 78);

    doc.setFont("helvetica", "bold");
    doc.text("THE ORGANIZER (RECEIVER)", 120, 65);
    doc.setFont("helvetica", "normal");
    doc.text(`${event.user?.name || "College Representative"}`, 120, 72);
    doc.text(`Event: ${event.title}`, 120, 78);

    // PAYMENT DETAILS
    doc.setFillColor(240, 242, 245);
    doc.rect(20, 95, 170, 45, "F");
    
    doc.setFont("helvetica", "bold");
    doc.setTextColor(44, 62, 80);
    doc.text("PAYMENT CONFIRMATION", 25, 108);
    
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text(`Amount Paid:`, 25, 120);
    doc.setFont("helvetica", "bold");
    doc.text(`INR ${mySponsorship.amount}/-`, 65, 120);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.text(`Transaction ID: ${mySponsorship.paymentId}`, 25, 130);
    doc.text(`Payment Date: ${new Date(mySponsorship.date || Date.now()).toLocaleDateString()}`, 120, 130);

    // TERMS
    doc.setFont("helvetica", "bold");
    doc.text("TERMS OF ENGAGEMENT", 20, 160);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    
    const terms = [
        "1. Funds received will be strictly used for the execution of the event mentioned.",
        "2. The Organizer is liable to provide the agreed branding deliverables to the Sponsor.",
        "3. This agreement serves as a binding proof of the sponsorship transaction.",
        "4. Refunds are governed by the platform's policy (available within 24h/7days pre-event).",
        "5. Disputes shall be resolved amicably through the CampusSponsor platform."
    ];
    let y = 170;
    terms.forEach(t => { doc.text(t, 20, y); y += 8; });

    // STAMP
    const stampX = 150;
    const stampY = 240;
    doc.setDrawColor(22, 160, 133);
    doc.setLineWidth(1.5);
    doc.circle(stampX, stampY, 22, "S"); 
    doc.setLineWidth(0.5);
    doc.circle(stampX, stampY, 20, "S");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(22, 160, 133);
    doc.text("CAMPUS", stampX, stampY - 5, { align: "center" });
    doc.text("VERIFIED", stampX, stampY + 0, { align: "center" });
    doc.text("SPONSOR", stampX, stampY + 5, { align: "center" });
    
    doc.setFontSize(7);
    doc.text(`DATE: ${new Date().toLocaleDateString()}`, stampX, stampY + 12, { align: "center" });

    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.setFont("helvetica", "italic");
    doc.text("This is a system-generated document & acts as a digital proof. No physical signature required.", pageWidth / 2, 280, { align: "center" });

    doc.save(`Sponsorship_Agreement_${refId}.pdf`);
    toast.success("Stamped Agreement Downloaded!");
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    if (user.role !== 'sponsor') return toast.error("Only Sponsors can pay!");
    
    try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const meRes = await axios.get('https://campus-sponser-api.onrender.com/api/users/me', config);
        if (!meRes.data.isVerified) return toast.error("🚫 Not Verified by Admin!");
    } catch (err) { return; }

    if (!amount || amount < 1) return toast.error("Enter valid amount");

    setLoading(true);
    try {
        const { data: order } = await axios.post('https://campus-sponser-api.onrender.com/api/payment/order', { amount, eventId: id });

        const options = {
            key: "rzp_test_RzpjqjoYNvSTMY",
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
                    await axios.post('https://campus-sponser-api.onrender.com/api/payment/verify', verifyData);
                    toast.success("🎉 Payment Successful!");
                    fetchEvent(); 
                } catch (error) { toast.error("Verification Failed"); }
            },
            prefill: { name: user.name, email: user.email, contact: user.phone },
            theme: { color: "#2563eb" }
        };
        const rzp1 = new window.Razorpay(options);
        rzp1.open();
    } catch (error) {
        toast.error(error.response?.data?.message || "Payment Failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '20px', fontFamily:'Poppins' }}>
      
      {/* HEADER CARD */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        
        {/* 🔥 NEW: SMART TIMELINE UI */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', padding: '15px', background: '#f8fafc', borderRadius: '12px' }}>
          {stages.map((s, i) => (
            <div key={s} style={{ textAlign: 'center', flex: 1, position: 'relative' }}>
              <div style={{ 
                width: '30px', height: '30px', borderRadius: '50%', 
                background: i <= currentStep ? '#3b82f6' : '#e2e8f0', 
                margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', color: i <= currentStep ? 'white' : '#64748b', fontWeight: 'bold'
              }}>
                {i + 1}
              </div>
              <p style={{ fontSize: '0.7rem', marginTop: '8px', color: i <= currentStep ? '#3b82f6' : '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>
                {s}
              </p>
            </div>
          ))}
        </div>

        <h1 style={{ fontSize: '2.5rem', color: '#1e293b', marginBottom: '10px' }}>{event.title}</h1>
        
        {/* FUNDING PROGRESS BAR */}
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
                <p style={{color:'#64748b', marginBottom:'20px'}}>Thank you for contributing ₹{mySponsorship.amount}.</p>
                <button onClick={downloadAgreement} style={{padding:'15px 30px', background:'#0f172a', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem', boxShadow:'0 4px 10px rgba(0,0,0,0.3)', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px', margin:'0 auto'}}>
                    <span>📄</span> Download Stamped Agreement
                </button>
            </div>
        ) : isFullyFunded ? (
            <div style={{textAlign:'center'}}>
                <h2 style={{color:'#22c55e'}}>🎉 Event Fully Funded!</h2>
                <p>No more sponsors needed for this event.</p>
            </div>
        ) : user?.role === 'sponsor' ? (
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