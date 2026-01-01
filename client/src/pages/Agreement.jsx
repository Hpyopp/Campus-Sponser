import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const Agreement = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Load Signature Font
    const link = document.createElement('link');
    link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);

    // 2. Check User
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(storedUser);

    if (!storedUser) {
        navigate('/login');
        return;
    }

    // 3. Fetch Event
    const fetchEvent = async () => {
      try {
        const res = await axios.get(`/api/events/${id}`);
        setEvent(res.data);
      } catch (error) {
        console.error(error);
        alert("Error loading agreement.");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  if (loading) return <div style={{textAlign:'center', padding:'50px'}}>Generating Legal Doc... ⚖️</div>;
  if (!event || !currentUser) return null;

  // 👇 ADMIN VIEW LOGIC (URL se Sponsor ID uthao agar Admin ho)
  const queryParams = new URLSearchParams(location.search);
  const paramSponsorId = queryParams.get('sponsorId');
  
  const targetSponsorId = (currentUser.role === 'admin' && paramSponsorId) 
                            ? paramSponsorId 
                            : currentUser._id;

  const mySponsorship = event.sponsors?.find(s => s.sponsorId === targetSponsorId);

  if (!mySponsorship) {
      return (
          <div style={{textAlign:'center', padding:'50px'}}>
              <h2>❌ Document Not Found</h2>
              <p>No sponsorship record found for this user.</p>
              <button onClick={() => navigate(-1)} style={{padding:'10px 20px', cursor:'pointer'}}>Go Back</button>
          </div>
      );
  }

  // Data Variables
  const sponsorName = mySponsorship.name;
  const sponsorEmail = mySponsorship.email;
  const contributionAmount = mySponsorship.amount;
  const dealDate = mySponsorship.date;
  const status = mySponsorship.status; // 'confirmed' or 'refund_requested'

  const organizerName = event.user?.name || "Event Coordinator";
  const organizerEmail = event.user?.email || "Email Hidden";
  const organizerCollege = event.user?.collegeName || "Campus Event Committee";

  return (
    <div style={{ background: '#525659', minHeight: '100vh', padding: '40px 0' }}>
      
      {/* ADMIN BANNER */}
      {currentUser.role === 'admin' && (
          <div className="no-print" style={{textAlign:'center', color:'white', marginBottom:'15px', background:'#f97316', padding:'10px'}}>
              👮 ADMIN MODE: Viewing Proof for <strong>{sponsorName}</strong>
          </div>
      )}

      {/* --- A4 PAPER START --- */}
      <div className="print-area" style={{ 
          padding: '50px 60px', fontFamily: '"Times New Roman", Times, serif', 
          maxWidth: '800px', margin: '0 auto', background: '#fff', 
          boxShadow: '0 0 20px rgba(0,0,0,0.3)', color: '#000', minHeight: '1000px', position:'relative'
      }}>
        
        {/* LOGO */}
        <div style={{ textAlign: 'center', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                🚀 CampuSponsor
            </span>
        </div>

        {/* TITLE */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize: '2rem', margin: '0', textDecoration:'underline' }}>Sponsorship Agreement</h1>
          <p style={{ fontStyle: 'italic', color: '#444', marginTop: '5px', fontSize:'1rem' }}>Memorandum of Understanding (MoU)</p>
        </div>

        {/* CONTENT */}
        <div style={{ lineHeight: '1.6', fontSize: '1.05rem', textAlign: 'justify' }}>
          <p style={{marginBottom:'20px'}}>
            This Agreement is made on <strong>{new Date(dealDate).toLocaleDateString()}</strong>, by and between:
          </p>

          {/* PARTIES (Side-by-Side Professional Layout) */}
          <div style={{ display:'flex', justifyContent:'space-between', gap:'20px', background: '#f8fafc', padding: '20px', border: '1px solid #94a3b8', marginBottom: '20px', textAlign:'left' }}>
            
            {/* SPONSOR */}
            <div style={{width:'48%'}}>
                <div style={{fontSize:'0.9rem', color:'#64748b', textDecoration:'underline', marginBottom:'5px'}}>THE SPONSOR:</div>
                <div style={{fontSize: '1.2rem', textTransform: 'uppercase', fontWeight:'bold', lineHeight:'1.2'}}>{sponsorName}</div>
                <div style={{fontSize:'0.9rem', color:'#334155', marginTop:'2px'}}>Email: {sponsorEmail}</div>
            </div>

            {/* ORGANIZER */}
            <div style={{width:'48%', borderLeft:'1px solid #cbd5e1', paddingLeft:'20px'}}>
                <div style={{fontSize:'0.9rem', color:'#64748b', textDecoration:'underline', marginBottom:'5px'}}>THE ORGANIZER:</div>
                <div style={{fontSize: '1.2rem', fontWeight:'bold', lineHeight:'1.2'}}>{organizerCollege}</div>
                <div style={{fontSize:'0.9rem', color:'#334155', marginTop:'2px'}}>Rep: {organizerName}</div>
                <div style={{fontSize:'0.9rem', color:'#334155'}}>Email: {organizerEmail}</div>
            </div>
          </div>

          <p>
            WHEREAS, the Organizer is hosting an event titled <strong>"{event.title}"</strong> scheduled for <strong>{new Date(event.date).toLocaleDateString()}</strong> at <strong>{event.location}</strong>.
          </p>
          <p>WHEREAS, the Sponsor has agreed to provide financial support for the Event.</p>

          {/* AMOUNT BOX */}
          <div style={{ textAlign: 'center', margin: '20px 0', padding: '15px', border: '3px solid #000', display: 'block' }}>
            <span style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Total Sponsorship Amount</span><br/>
            <strong style={{ fontSize: '2.5rem', color: '#000', lineHeight:'1.2' }}>₹ {contributionAmount}</strong>
          </div>

          <p style={{marginBottom:'5px'}}><strong>TERMS & CONDITIONS:</strong></p>
          <ol style={{ marginLeft: '20px', marginTop:'0' }}>
            <li>The Sponsor confirms the payment of the above amount towards the event budget.</li>
            <li>The Organizer agrees to acknowledge the Sponsor's contribution in event promotions.</li>
            <li>This document serves as binding proof of the sponsorship arrangement.</li>
          </ol>
        </div>

        {/* --- SIGNATURES SECTION --- */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '60px', alignItems: 'flex-end' }}>
          
          {/* SPONSOR SIGN */}
          <div style={{ width: '40%', textAlign: 'center', position:'relative' }}>
            <div style={{ 
                fontFamily: '"Dancing Script", cursive', fontSize: '2.2rem', color: '#1e3a8a', 
                marginBottom: '-10px', transform: 'rotate(-5deg)', zIndex: 10
            }}>
                {sponsorName}
            </div>
            <div style={{ borderBottom: '2px solid #000', marginBottom: '5px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize:'0.9rem' }}>Authorized Signatory</p>
            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase' }}>For {sponsorName}</p>
          </div>

          {/* ORGANIZER STAMP (Dynamic based on Status) */}
          <div style={{ width: '40%', textAlign: 'center' }}>
             
             {status === 'refund_requested' ? (
                 // 🔴 RED STAMP FOR REFUND PENDING
                 <div style={{ 
                    border: '3px solid #dc2626', color: '#dc2626', borderRadius: '5px', 
                    width: '120px', height: '80px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', 
                    margin: '0 auto 10px auto', transform: 'rotate(-10deg)',
                    background: 'rgba(220, 38, 38, 0.05)'
                 }}>
                    REFUND<br/>PENDING
                 </div>
             ) : (
                 // 🟢 GREEN STAMP FOR VERIFIED
                 <div style={{ 
                    border: '3px solid #16a34a', color: '#16a34a', borderRadius: '50%', 
                    width: '90px', height: '90px', 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontWeight: 'bold', fontSize: '0.7rem', textAlign: 'center', 
                    margin: '0 auto 10px auto', transform: 'rotate(-10deg)',
                    boxShadow: 'inset 0 0 5px rgba(22, 163, 74, 0.2)'
                 }}>
                    PAYMENT<br/>VERIFIED<br/>RECEIVED
                 </div>
             )}

            <div style={{ borderBottom: '2px solid #000', marginBottom: '5px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold', fontSize:'0.9rem' }}>Event Coordinator</p>
            <p style={{ margin: 0, fontSize: '0.75rem', textTransform: 'uppercase' }}>CampusSponsor Verified</p>
          </div>
        </div>

      </div>
      {/* --- A4 PAPER END --- */}

      {/* FOOTER ACTIONS */}
      <div className="no-print" style={{ marginTop: '40px', textAlign: 'center', display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <button onClick={() => window.print()} style={{ padding: '12px 25px', background: '#0f172a', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>🖨️ Print Agreement</button>
        
        {currentUser.role === 'admin' ? (
            <button onClick={() => navigate('/admin/refunds')} style={{ padding: '12px 25px', background: '#f97316', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>Back to Admin Panel</button>
        ) : (
            <button onClick={() => navigate(`/event/${id}`)} style={{ padding: '12px 25px', background: 'transparent', border: '2px solid #fff', color:'white', cursor: 'pointer', borderRadius: '5px', fontWeight: 'bold' }}>Back to Event</button>
        )}
      </div>

      <style>{`
        @media print {
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; margin: 0 !important; padding: 40px !important; border:none !important; boxShadow:none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
};
export default Agreement;