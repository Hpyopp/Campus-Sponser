import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminRefunds = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/login'); return; }
    fetchRefunds();
  }, []);

  const fetchRefunds = async () => {
    try {
      const res = await axios.get('/api/events');
      const allEvents = res.data;
      
      // 👇 Filter Logic: Sirf wahi sponsors nikalo jinhone Refund manga hai
      let pendingRefunds = [];
      allEvents.forEach(event => {
          if(event.sponsors){
              event.sponsors.forEach(sponsor => {
                  if(sponsor.status === 'refund_requested'){
                      pendingRefunds.push({
                          eventId: event._id,
                          eventTitle: event.title,
                          sponsorId: sponsor.sponsorId,
                          sponsorName: sponsor.name,
                          companyName: sponsor.companyName,
                          amount: sponsor.amount,
                          date: sponsor.date,
                          email: sponsor.email
                      });
                  }
              });
          }
      });
      setRefunds(pendingRefunds);
    } catch (error) { toast.error("Failed to fetch data"); }
    finally { setLoading(false); }
  };

  // 1. APPROVE REFUND (Paisa Wapas, Sponsor Removed)
  const handleApprove = async (eventId, sponsorId) => {
      if(!window.confirm("⚠️ Confirm Refund? This will remove the sponsor and decrease funds.")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/events/admin/approve-refund', { eventId, sponsorId }, config);
          toast.success("Refund Processed. Sponsor Removed.");
          fetchRefunds(); // Refresh List
      } catch (error) { toast.error("Action Failed"); }
  };

  // 2. REJECT REFUND (Deal Valid, Sponsor stays)
  const handleReject = async (eventId, sponsorId) => {
      if(!window.confirm("⛔ Reject Refund Request? The deal will remain valid.")) return;
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          await axios.post('/api/events/admin/reject-refund', { eventId, sponsorId }, config);
          toast.error("Refund Rejected. Deal is Active.");
          fetchRefunds(); // Refresh List
      } catch (error) { toast.error("Action Failed"); }
  };

  return (
    <div style={{ padding: '40px', background: '#fff1f2', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <button onClick={() => navigate('/admin')} style={{marginBottom:'20px', padding:'10px 20px', background:'white', border:'1px solid #ccc', borderRadius:'5px', cursor:'pointer'}}>⬅ Back to Dashboard</button>
        
        <h1 style={{ color: '#be123c', display:'flex', alignItems:'center', gap:'10px' }}>
            💸 Refund Disputes Manager
        </h1>
        <p style={{color:'#881337'}}>Manage high-priority cancellation requests here.</p>

        {loading ? (
            <div style={{textAlign:'center', marginTop:'50px'}}>Scanning requests...</div>
        ) : refunds.length > 0 ? (
            <div style={{ display: 'grid', gap: '20px', marginTop: '30px' }}>
                {refunds.map((item, index) => (
                    <div key={index} style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(220, 38, 38, 0.1)', borderLeft: '5px solid #be123c', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'20px' }}>
                        
                        {/* Details */}
                        <div>
                            <div style={{fontSize:'0.9rem', color:'#be123c', fontWeight:'bold', textTransform:'uppercase', marginBottom:'5px'}}>Refund Request #{index + 1}</div>
                            <h2 style={{margin:'0 0 5px 0', color:'#1e293b'}}>₹{item.amount}</h2>
                            <div style={{fontSize:'1.1rem', fontWeight:'bold', color:'#334155'}}>🏢 {item.companyName} <span style={{fontSize:'0.9rem', fontWeight:'normal'}}>({item.sponsorName})</span></div>
                            <div style={{color:'#64748b', marginTop:'5px'}}>Event: <strong>{item.eventTitle}</strong></div>
                            <div style={{fontSize:'0.85rem', color:'#94a3b8', marginTop:'5px'}}>Requested on: {new Date().toLocaleDateString()}</div>
                        </div>

                        {/* Action Buttons */}
                        <div style={{display:'flex', flexDirection:'column', gap:'10px', minWidth:'160px'}}>
                            <button 
                                onClick={() => handleApprove(item.eventId, item.sponsorId)}
                                style={{padding:'12px', background:'#be123c', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontWeight:'bold', display:'flex', alignItems:'center', justifyContent:'center', gap:'5px'}}
                            >
                                ✅ Approve Refund
                            </button>
                            <button 
                                onClick={() => handleReject(item.eventId, item.sponsorId)}
                                style={{padding:'12px', background:'white', color:'#1e293b', border:'1px solid #cbd5e1', borderRadius:'8px', cursor:'pointer', fontWeight:'bold'}}
                            >
                                ❌ Reject Request
                            </button>
                            <a href={`mailto:${item.email}`} style={{textAlign:'center', fontSize:'0.85rem', color:'#2563eb', textDecoration:'none'}}>Contact Sponsor</a>
                        </div>

                    </div>
                ))}
            </div>
        ) : (
            <div style={{ textAlign: 'center', marginTop: '50px', padding: '40px', background: 'white', borderRadius: '15px', color: '#166534', border: '1px solid #bbf7d0' }}>
                <h2>✅ No Disputes!</h2>
                <p>All sponsorships are secure. No refunds requested.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AdminRefunds;