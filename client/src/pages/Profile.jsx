import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { jsPDF } from "jspdf"; 

const Profile = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));
  const [myEvents, setMyEvents] = useState([]); 
  const [sponsoredEvents, setSponsoredEvents] = useState([]); 

  useEffect(() => {
    if (!user) navigate('/login');
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
        const { data: allEvents } = await axios.get('/api/events');
        
        if (user.role === 'student') {
            const mine = allEvents.filter(e => e.user?._id === user._id || e.user === user._id);
            setMyEvents(mine);
        } else if (user.role === 'sponsor') {
            const sponsored = allEvents.filter(e => e.sponsors.some(s => s.sponsorId === user._id));
            setSponsoredEvents(sponsored);
        }
    } catch (error) { console.error(error); }
  };

  const handleRefundRequest = async (eventId) => {
      if(!window.confirm("Are you sure? This will cancel your sponsorship.")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.put(`/api/events/${eventId}/refund-request`, {}, config);
          toast.success("Refund Requested! Admin will verify.");
          fetchData();
      } catch (error) { toast.error("Request Failed"); }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  // 👇 FINAL PROFESSIONAL PDF GENERATOR (No Overlap)
  const generateAgreement = (event, sponsorData) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;

    // 1. PAGE BORDER
    doc.setLineWidth(1);
    doc.setDrawColor(44, 62, 80); // Dark border
    doc.rect(5, 5, pageWidth - 10, pageHeight - 10); // Border around page

    // 2. HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(41, 128, 185); // Blue
    doc.text("SPONSORSHIP AGREEMENT", pageWidth / 2, 25, { align: "center" });
    
    // Ref & Date
    doc.setFontSize(10);
    doc.setTextColor(100);
    const txnId = sponsorData.paymentId || "TXN-PENDING";
    doc.text(`Reference: CSP-${txnId.slice(-6).toUpperCase()}`, 150, 15);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 15);

    // Line Divider
    doc.setLineWidth(0.5);
    doc.setDrawColor(200);
    doc.line(15, 35, 195, 35);

    // 3. PARTIES SECTION (Using Split Text to avoid overlap)
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "normal");
    doc.text("This Agreement is made and entered into by:", 20, 50);

    // -- LEFT SIDE: SPONSOR --
    doc.setFont("helvetica", "bold");
    doc.text("THE SPONSOR", 20, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const sponsorName = sponsorData.companyName || sponsorData.name || "Sponsor";
    const sponsorEmail = sponsorData.email || "N/A";
    
    // Wrap text if too long
    const sponsorLines = doc.splitTextToSize(`${sponsorName}\n${sponsorEmail}`, 80);
    doc.text(sponsorLines, 20, 75);

    // -- RIGHT SIDE: ORGANIZER --
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("THE ORGANIZER", 120, 65);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    const organizerName = event.user?.name || "College Rep";
    const organizerEmail = event.user?.email || "organizer@college.edu";

    const orgLines = doc.splitTextToSize(`${organizerName}\n${organizerEmail}\nEvent: ${event.title}`, 80);
    doc.text(orgLines, 120, 75);

    // 4. PAYMENT BOX (Grey Background)
    doc.setFillColor(245, 247, 250);
    doc.setDrawColor(220);
    doc.rect(20, 110, 170, 40, "FD"); // Fill & Draw Border

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(44, 62, 80);
    doc.text("PAYMENT DETAILS", 25, 122);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0);
    doc.text(`Amount Received:`, 25, 135);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`INR ${sponsorData.amount}/-`, 70, 135);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`Transaction ID: ${txnId}`, 25, 145);
    doc.text(`Status: VERIFIED`, 140, 135);

    // 5. TERMS
    doc.setFont("helvetica", "bold");
    doc.text("TERMS & CONDITIONS", 20, 170);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const terms = [
        "1. The Organizer acknowledges the receipt of funds for the stated event.",
        "2. The Sponsor is entitled to the branding benefits as agreed upon.",
        "3. This document serves as a formal receipt and proof of partnership.",
        "4. Refunds are subject to the platform's policy (7 days prior notice).",
        "5. Disputes are to be resolved via CampusSponsor Admin intervention."
    ];
    let y = 180;
    terms.forEach(t => { doc.text(t, 20, y); y += 8; });

    // 6. DIGITAL STAMP (Fixed Layout)
    const stampX = 160;
    const stampY = 240;
    
    // Outer Circle
    doc.setDrawColor(22, 160, 133); // Teal Green
    doc.setLineWidth(1.5);
    doc.circle(stampX, stampY, 22);
    
    // Inner Circle
    doc.setLineWidth(0.5);
    doc.circle(stampX, stampY, 19);

    // Text in Stamp
    doc.setFontSize(8);
    doc.setTextColor(22, 160, 133);
    doc.setFont("helvetica", "bold");
    doc.text("CAMPUS", stampX, stampY - 5, { align: "center" });
    doc.text("VERIFIED", stampX, stampY + 1, { align: "center" });
    doc.text("SPONSOR", stampX, stampY + 7, { align: "center" });
    
    // Date in Stamp
    doc.setFontSize(6);
    doc.text(new Date().toLocaleDateString(), stampX, stampY + 14, { align: "center" });

    // 7. FOOTER
    doc.setFontSize(9);
    doc.setTextColor(150);
    doc.text("System Generated via CampusSponsor | Valid without physical signature.", pageWidth / 2, 280, { align: "center" });

    doc.save(`${event.title}_Agreement.pdf`);
    toast.success("Professional Agreement Downloaded!");
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '20px', fontFamily:'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap:'wrap', gap:'20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ width: '80px', height: '80px', background: '#2563eb', color: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', fontWeight: 'bold' }}>
                {user.name.charAt(0).toUpperCase()}
            </div>
            <div>
                <h1 style={{ margin: 0, color: '#1e293b' }}>{user.name}</h1>
                <p style={{ margin: '5px 0', color: '#64748b' }}>{user.email}</p>
                <span style={{ background: user.isVerified ? '#dcfce7' : '#fef9c3', color: user.isVerified ? '#166534' : '#854d0e', padding: '5px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {user.isVerified ? 'Verified ✅' : 'Pending Verification ⏳'}
                </span>
            </div>
        </div>
        <button onClick={handleLogout} style={{ padding: '10px 20px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>Logout</button>
      </div>

      <h2 style={{ marginTop: '40px', color: '#334155' }}>My Dashboard</h2>
      
      {/* 🎓 STUDENT VIEW */}
      {user.role === 'student' && (
        <div style={{ display: 'grid', gap: '20px' }}>
            {myEvents.map(event => (
                <div key={event._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', borderLeft: '5px solid #2563eb', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{event.title}</h3>
                    <div style={{display:'flex', gap:'20px', color:'#64748b', fontSize:'0.9rem', marginBottom:'15px'}}>
                        <span>Raised: ₹{event.raisedAmount || 0} / ₹{event.budget}</span>
                        <span>Sponsors: {event.sponsors.length}</span>
                    </div>

                    {event.sponsors.length > 0 ? (
                        <div style={{background:'#f8fafc', padding:'15px', borderRadius:'8px', border:'1px solid #e2e8f0'}}>
                            <strong style={{color:'#334155'}}>💰 Sponsors & Actions:</strong>
                            <div style={{marginTop:'10px', display:'flex', flexDirection:'column', gap:'10px'}}>
                                {event.sponsors.map((s, i) => (
                                    <div key={i} style={{display:'flex', justifyContent:'space-between', alignItems:'center', background:'white', padding:'10px', borderRadius:'5px', border:'1px solid #f1f5f9', flexWrap:'wrap', gap:'10px'}}>
                                        <div>
                                            <div style={{fontWeight:'bold', color:'#1e293b'}}>{s.companyName} <span style={{fontSize:'0.8rem', fontWeight:'normal'}}>({s.name})</span></div>
                                            <div style={{color:'#16a34a', fontSize:'0.9rem'}}>+ ₹{s.amount} • {s.status.toUpperCase()}</div>
                                        </div>
                                        
                                        <div style={{display:'flex', gap:'10px'}}>
                                            <a href={`mailto:${s.email}`} style={{textDecoration:'none', background:'#e0f2fe', color:'#0284c7', padding:'5px 10px', borderRadius:'5px', fontSize:'0.8rem', fontWeight:'bold'}}>📧 Contact</a>
                                            {s.status === 'verified' && (
                                                <button onClick={() => generateAgreement(event, s)} style={{background:'#f1f5f9', border:'1px solid #cbd5e1', padding:'5px 10px', borderRadius:'5px', cursor:'pointer', fontSize:'0.8rem'}}>📄 Agreement</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div style={{fontSize:'0.9rem', color:'#94a3b8', fontStyle:'italic'}}>No sponsors yet. Share your event!</div>
                    )}
                </div>
            ))}
            {myEvents.length === 0 && <p>No events created yet.</p>}
        </div>
      )}

      {/* 🤝 SPONSOR VIEW */}
      {user.role === 'sponsor' && (
        <div style={{ display: 'grid', gap: '20px' }}>
            {sponsoredEvents.map(event => {
                const mySponsorship = event.sponsors.find(s => s.sponsorId === user._id);
                // Date Logic
                const paymentDate = new Date(mySponsorship.date || Date.now());
                const eventDate = new Date(event.date);
                const now = new Date();
                const hoursSincePayment = (now - paymentDate) / (1000 * 60 * 60);
                const daysBeforeEvent = (eventDate - paymentDate) / (1000 * 60 * 60 * 24);
                const canRequestRefund = mySponsorship.status === 'verified' && hoursSincePayment <= 24 && daysBeforeEvent >= 7;

                return (
                    <div key={event._id} style={{ background: 'white', padding: '20px', borderRadius: '10px', borderLeft: `5px solid ${mySponsorship.status === 'verified' ? '#16a34a' : '#ef4444'}`, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start'}}>
                            <div>
                                <h3 style={{ margin: '0 0 5px 0' }}>{event.title}</h3>
                                <p style={{color:'#64748b', fontSize:'0.9rem'}}>Paid: ₹{mySponsorship.amount} | Status: <strong>{mySponsorship.status}</strong></p>
                            </div>
                            
                            <div style={{textAlign:'right'}}>
                                <div style={{fontSize:'0.8rem', color:'#64748b'}}>Organizer Contact:</div>
                                <a href={`mailto:${event.user?.email}`} style={{color:'#2563eb', fontWeight:'bold', textDecoration:'none', fontSize:'0.9rem'}}>
                                    📧 {event.user?.email || "Email Hidden"}
                                </a>
                            </div>
                        </div>

                        <div style={{display:'flex', gap:'10px', marginTop:'15px', flexWrap:'wrap'}}>
                             <button onClick={() => generateAgreement(event, mySponsorship)} style={{background:'#1e293b', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontSize:'0.85rem'}}>
                                📄 Download Agreement
                            </button>

                            <button onClick={() => navigate(`/event/${event._id}`)} style={{background:'#e2e8f0', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontSize:'0.85rem'}}>
                                View Event
                            </button>
                            
                            {canRequestRefund && (
                                <button onClick={() => handleRefundRequest(event._id)} style={{background:'#fee2e2', color:'#dc2626', border:'1px solid #dc2626', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontSize:'0.85rem'}}>
                                    Request Refund
                                </button>
                            )}
                        </div>
                    </div>
                )
            })}
            {sponsoredEvents.length === 0 && <p>You haven't sponsored any events yet.</p>}
        </div>
      )}
    </div>
  );
};

export default Profile;