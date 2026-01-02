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
    // Load Signature Font
    const link = document.createElement('link'); link.href = "https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap"; link.rel = "stylesheet"; document.head.appendChild(link);
    
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setCurrentUser(storedUser);
    if (!storedUser) { navigate('/login'); return; }

    const fetchEvent = async () => {
      try { 
          const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
          const res = await axios.get(`/api/events/${id}`, config); 
          setEvent(res.data); 
      } catch (error) { alert("Error loading agreement."); }
    };
    fetchEvent();
  }, [id, navigate]);

  if (!event || !currentUser) return null;

  // 👇 ERROR FIX LOGIC START
  const queryParams = new URLSearchParams(location.search);
  const paramSponsorId = queryParams.get('sponsorId');
  
  // Logic: Agar URL mein sponsorId hai (Organizer/Admin ke liye), toh wo use karo.
  // Nahi toh, Logged In User ka ID use karo (Sponsor ke liye).
  const targetSponsorId = paramSponsorId ? paramSponsorId : currentUser._id;
  
  const mySponsorship = event.sponsors?.find(s => s.sponsorId === targetSponsorId);
  // 👆 ERROR FIX LOGIC END

  if (!mySponsorship) return <div style={{textAlign:'center', padding:'50px', fontFamily:'Poppins'}}><h2>❌ Agreement Not Found</h2><p>Record does not match.</p><button onClick={() => navigate(-1)} style={{padding:'10px 20px', cursor:'pointer'}}>Go Back</button></div>;

  const isOrganizer = event.user._id === currentUser._id;
  const isAdmin = currentUser.role === 'admin';
  const isSponsor = currentUser._id === mySponsorship.sponsorId;
  const canViewComment = isOrganizer || isAdmin || isSponsor;

  return (
    <div style={{ background: '#525659', minHeight: '100vh', padding: '40px 0' }}>
      
      {(isAdmin || isOrganizer) && <div className="no-print" style={{textAlign:'center', color:'white', marginBottom:'15px', background:'#f97316', padding:'10px'}}>👮 OFFICIAL VIEW MODE</div>}

      <div className="print-area" style={{ padding: '60px', fontFamily: '"Times New Roman", Times, serif', maxWidth: '800px', margin: '0 auto', background: '#fff', boxShadow: '0 0 20px rgba(0,0,0,0.3)', minHeight: '1000px', position:'relative' }}>
        
        {/* HEADER */}
        <div style={{ textAlign: 'center', marginBottom: '40px', borderBottom: '2px solid #000', paddingBottom: '20px' }}>
            <h1 style={{ textTransform: 'uppercase', fontSize: '2rem', margin: '0' }}>Sponsorship Agreement</h1>
            <p style={{ fontStyle: 'italic', margin: '5px 0', fontSize:'1.1rem' }}>Memorandum of Understanding (MoU)</p>
        </div>

        <div style={{ lineHeight: '1.8', fontSize: '1.1rem', textAlign: 'justify' }}>
          <p>This Agreement is executed on <strong>{new Date(mySponsorship.date).toLocaleDateString()}</strong> between:</p>

          <div style={{ display:'flex', justifyContent:'space-between', margin:'20px 0', background:'#f8fafc', padding:'20px', border:'1px solid #ddd' }}>
            <div style={{width:'48%'}}>
                <strong style={{textDecoration:'underline', color:'#666'}}>THE SPONSOR:</strong><br/>
                {(isOrganizer || isAdmin) ? (
                    <span style={{color:'#d97706', fontWeight:'bold', fontSize:'1.1rem'}}>🏢 {mySponsorship.companyName || "Company Name"}</span>
                ) : (
                    <span>{mySponsorship.name}</span>
                )}
                <br/>
                <span style={{fontSize:'0.9rem'}}>{mySponsorship.email}</span>
            </div>
            <div style={{width:'48%', textAlign:'right'}}>
                <strong style={{textDecoration:'underline', color:'#666'}}>THE ORGANIZER:</strong><br/>
                <span style={{fontWeight:'bold'}}>Student Committee</span><br/>
                <span style={{fontSize:'1.1rem', fontWeight:'bold', color:'#1e3a8a'}}>{event.user?.collegeName || "Campus Institute"}</span><br/>
                <span style={{fontSize:'0.9rem'}}>Event: {event.title}</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '30px 0 10px 0', padding: '20px', border: '3px double #000' }}>
            <span style={{ textTransform: 'uppercase', letterSpacing: '1px', fontSize:'0.9rem' }}>Committed Sponsorship Amount</span><br/>
            <strong style={{ fontSize: '2.5rem' }}>₹ {mySponsorship.amount}</strong>
          </div>

          {canViewComment && mySponsorship.comment && (
              <div style={{ textAlign:'center', marginBottom:'30px', padding:'15px', background:'#fffbeb', border:'1px dashed #f59e0b', color:'#92400e', fontSize:'0.9rem', borderRadius:'8px' }}>
                  <strong>Note:</strong> <em>"{mySponsorship.comment}"</em>
              </div>
          )}

          <p><strong>TERMS & CONDITIONS:</strong></p>
          <ol style={{ marginLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}>The Organizer agrees to provide branding and promotion as discussed mutually.</li>
            <li style={{ marginBottom: '10px' }}>
                {mySponsorship.status === 'verified' 
                    ? "✅ Payment verified. All financial obligations are met." 
                    : <span style={{color:'#dc2626', fontWeight:'bold'}}>⚠️ CRITICAL: The Sponsor must transfer the pledged amount within 3 BUSINESS DAYS, otherwise this deal stands void/cancelled.</span>
                }
            </li>
            <li>This document serves as a binding proof of the sponsorship arrangement.</li>
          </ol>
        </div>

        {/* 👇 ALIGNMENT FIXED SECTION */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '100px', alignItems: 'flex-end' }}>
          
          {/* Left: Signature */}
          <div style={{ width:'200px', display:'flex', flexDirection:'column', alignItems:'center' }}>
            <div style={{ fontFamily: '"Dancing Script", cursive', fontSize: '2rem', color: '#1e3a8a', marginBottom: '5px' }}>{mySponsorship.name}</div>
            <div style={{ borderTop: '1px solid #000', width:'100%', paddingTop:'5px', textAlign:'center' }}>Authorized Signature</div>
          </div>

          {/* Right: Stamp & Verify */}
          <div style={{ width:'200px', display:'flex', flexDirection:'column', alignItems:'center', position:'relative' }}>
             
             {/* Stamp Wrapper */}
             <div style={{ height:'130px', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:'-25px', zIndex:10 }}>
                {mySponsorship.status === 'verified' ? (
                     <div style={{ border: '5px double #16a34a', color: '#16a34a', borderRadius: '50%', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column', fontWeight: 'bold', fontSize: '0.9rem', textAlign: 'center', transform: 'rotate(-15deg)', background:'rgba(22, 163, 74, 0.05)', boxShadow:'0 0 10px rgba(22, 163, 74, 0.2)' }}>
                        <span>OFFICIAL</span><span style={{fontSize:'1.2rem', lineHeight:'1'}}>DEAL</span><span>DONE</span>
                     </div>
                ) : mySponsorship.status === 'refund_requested' ? (
                     <div style={{ border: '4px double #dc2626', color: '#dc2626', borderRadius: '8px', width: '140px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', transform: 'rotate(-10deg)', background:'rgba(220, 38, 38, 0.05)' }}>
                        REFUND<br/>REQUESTED
                     </div>
                ) : (
                     <div style={{ border: '4px double #2563eb', color: '#2563eb', borderRadius: '50%', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection:'column', fontWeight: 'bold', fontSize: '0.8rem', textAlign: 'center', transform: 'rotate(-15deg)', background:'rgba(37, 99, 235, 0.05)' }}>
                        <span>PLEDGE</span><span style={{fontSize:'1.1rem', lineHeight:'1'}}>RECORDED</span><span style={{fontSize:'0.6rem'}}>(Pending)</span>
                     </div>
                )}
             </div>

            <div style={{ borderTop: '1px solid #000', width:'100%', paddingTop:'5px', textAlign:'center', background:'rgba(255,255,255,0.8)', zIndex:20 }}>Platform Verified</div>
          </div>

        </div>
      </div>

      <div className="no-print" style={{ marginTop: '30px', textAlign: 'center' }}>
        <button onClick={() => window.print()} style={{ padding: '12px 25px', cursor: 'pointer', fontSize:'1rem' }}>🖨️ Print / Save PDF</button>
        <button onClick={() => navigate(-1)} style={{ marginLeft:'10px', padding: '12px 25px', cursor: 'pointer', fontSize:'1rem' }}>Go Back</button>
      </div>
      
      <style>{`@media print { body * { visibility: hidden; } .print-area, .print-area * { visibility: visible; } .print-area { position: absolute; left: 0; top: 0; width: 100%; margin:0; padding:40px; } .no-print { display: none; } }`}</style>
    </div>
  );
};
export default Agreement;