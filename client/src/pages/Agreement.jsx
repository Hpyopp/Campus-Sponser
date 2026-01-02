import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const Agreement = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const link = document.createElement('link'); link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"; link.rel = "stylesheet"; document.head.appendChild(link);
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(storedUser);
    if (!storedUser) { navigate('/login'); return; }

    const fetchEvent = async () => {
      try { const res = await axios.get(`/api/events/${id}`); setEvent(res.data); } 
      catch (error) { alert("Error loading agreement."); }
    };
    fetchEvent();
  }, [id, navigate]);

  if (!event || !currentUser) return null;

  // Identify Sponsor
  const queryParams = new URLSearchParams(location.search);
  const paramSponsorId = queryParams.get('sponsorId');
  const targetSponsorId = (currentUser.role === 'admin' && paramSponsorId) ? paramSponsorId : currentUser._id;
  const mySponsorship = event.sponsors?.find(s => s.sponsorId === targetSponsorId);

  if (!mySponsorship) return <div style={{textAlign:'center', padding:'50px'}}><h2>❌ Record Not Found</h2><button onClick={() => navigate(-1)}>Go Back</button></div>;

  // 👇 PRIVACY LOGIC: Comment kaun dekh sakta hai?
  // 1. Admin | 2. Event Owner (Organizer) | 3. Khud Sponsor
  const canViewComment = 
      currentUser.role === 'admin' || 
      currentUser._id === event.user._id || 
      currentUser._id === mySponsorship.sponsorId;

  return (
    <div style={{ background: '#525659', minHeight: '100vh', padding: '40px 0' }}>
      
      {currentUser.role === 'admin' && <div className="no-print" style={{textAlign:'center', color:'white', marginBottom:'15px', background:'#f97316', padding:'10px'}}>👮 ADMIN VIEW MODE</div>}

      {/* --- A4 PAPER --- */}
      <div className="print-area" style={{ padding: '60px', fontFamily: '"Times New Roman", Times, serif', maxWidth: '800px', margin: '0 auto', background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.3)', minHeight: '1000px', position:'relative' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
            <h1 style={{ textTransform: 'uppercase', fontSize: '2rem', margin: '0' }}>Sponsorship Commitment</h1>
            <p style={{ fontStyle: 'italic', margin: '5px 0', fontSize:'1.1rem' }}>Memorandum of Understanding (MoU)</p>
        </div>

        {/* CONTENT */}
        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', textAlign: 'justify' }}>
          <p>This Agreement is made on <strong>{new Date(mySponsorship.date).toLocaleDateString()}</strong> between:</p>

          <div style={{ display:'flex', justifyContent:'space-between', margin:'20px 0', background:'#f8fafc', padding:'20px', border:'1px solid #ddd' }}>
            
            {/* SPONSOR DETAILS */}
            <div style={{width:'48%'}}>
                <strong style={{textDecoration:'underline', color:'#666'}}>THE SPONSOR:</strong><br/>
                <span style={{fontSize:'1.2rem', fontWeight:'bold'}}>{mySponsorship.name}</span><br/>
                <span style={{fontSize:'0.9rem'}}>{mySponsorship.email}</span>
            </div>

            {/* ORGANIZER DETAILS (UPDATED AS REQUESTED) */}
            <div style={{width:'48%', textAlign:'right'}}>
                <strong style={{textDecoration:'underline', color:'#666'}}>THE ORGANIZER:</strong><br/>
                <span style={{fontWeight:'bold'}}>College Committee</span><br/>
                <span style={{fontSize:'1.1rem', fontWeight:'bold', color:'#1e3a8a'}}>{event.user?.collegeName || "Campus Institute"}</span><br/>
                <span style={{fontSize:'0.9rem'}}>Event: {event.title}</span>
            </div>
          </div>

          {/* AMOUNT BOX */}
          <div style={{ textAlign: 'center', margin: '30px 0 10px 0', padding: '20px', border: '3px double #000' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize:'0.9rem' }}>Committed Sponsorship Amount</span><br/>
            <strong style={{ fontSize: '2.5rem' }}>₹ {mySponsorship.amount}</strong>
          </div>

          {/* 👇 PRIVATE COMMENT SECTION (Only for Admin/Organizer/Sponsor) */}
          {canViewComment && mySponsorship.comment && (
              <div style={{ textAlign:'center', marginBottom:'30px', padding:'10px', background:'#fffbeb', border:'1px dashed #f59e0b', color:'#92400e', fontSize:'0.9rem' }}>
                  <strong>🔒 Private Note (Visible to Organizer & Admin):</strong><br/>
                  <em>"{mySponsorship.comment}"</em>
              </div>
          )}

          <p><strong>TERMS OF AGREEMENT:</strong></p>
          <ol style={{ marginLeft: '20px' }}>
            <li style={{ marginBottom: '10px', color:'#b91c1c', fontWeight:'bold' }}>
                The Sponsor agrees to transfer the full amount within <span style={{textDecoration:'underline'}}>3 Business Days</span>. Failure to do so will result in deal cancellation.
            </li>
            <li style={{ marginBottom: '10px' }}>The Organizer agrees to provide branding/promotion as discussed.</li>
            <li>This document serves as a binding proof of the sponsorship pledge.</li>
          </ol>
        </div>

        {/* SIGNATURES */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '80px', alignItems: 'flex-end' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '2rem', color: '#1e3a8a', marginBottom: '-10px' }}>{mySponsorship.name}</div>
            <div style={{ borderTop: '1px solid #000', width:'200px', paddingTop:'5px' }}>Sponsor Signature</div>
          </div>

          <div style={{ textAlign: 'center' }}>
             {/* BLUE STAMP */}
             <div style={{ border: '4px double #2563eb', color: '#2563eb', borderRadius: '50%', width: '110px', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', margin: '0 auto 10px auto', transform: 'rotate(-15deg)', background:'rgba(37, 99, 235, 0.05)' }}>
                OFFICIAL<br/>PLEDGE<br/>RECORDED
             </div>
            <div style={{ borderTop: '1px solid #000', width:'200px', paddingTop:'5px' }}>System Verified</div>
          </div>
        </div>

      </div>

      <div className="no-print" style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => window.print()} style={{ padding: '12px 25px', cursor: 'pointer', fontSize:'1rem' }}>🖨️ Print Agreement</button>
        <button onClick={() => navigate(-1)} style={{ marginLeft:'10px', padding: '12px 25px', cursor: 'pointer', fontSize:'1rem' }}>Go Back</button>
      </div>
      
      <style>{`@media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 100%; margin:0; padding:40px; } .no-print { display: none; } }`}</style>
    </div>
  );
};
export default Agreement;