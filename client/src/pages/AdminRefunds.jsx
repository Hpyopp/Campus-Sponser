import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRefunds = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        // Admin Token Bhejo
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        // Saare events fetch karo check karne ke liye
        const res = await axios.get('/api/events');
        
        const activeRequests = [];
        
        if (Array.isArray(res.data)) {
            res.data.forEach(event => {
                if (event.sponsors && Array.isArray(event.sponsors)) {
                    event.sponsors.forEach(s => {
                        // Sirf wahi dikhao jinhone Refund manga hai
                        if (s.status === 'refund_requested') {
                            activeRequests.push({
                                eventId: event._id,
                                eventTitle: event.title || 'Unknown Event',
                                sponsorId: s.sponsorId,
                                name: s.name || 'Unknown',
                                email: s.email,
                                // 👇 NEW DETAILS ADMIN KE LIYE
                                companyName: s.companyName || 'Individual Sponsor', 
                                comment: s.comment || '', 
                                amount: s.amount || 0
                            });
                        }
                    });
                }
            });
        }
        setRequests(activeRequests);
      } catch (error) {
        console.error("Error fetching refunds:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  // ✅ Approve Refund Logic
  const handleApprove = async (reqItem) => {
    if(!window.confirm(`✅ Approve refund of ₹${reqItem.amount} for ${reqItem.companyName}?`)) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      await axios.post('/api/events/admin/approve-refund', { 
          eventId: reqItem.eventId, 
          sponsorId: reqItem.sponsorId 
      }, config);
      
      alert("Refund Approved & Processed!");
      window.location.reload();
    } catch (error) { 
      alert("Error approving refund"); 
    }
  };

  // ❌ Reject Refund Logic
  const handleReject = async (reqItem) => {
    if(!window.confirm(`❌ Reject refund request for ${reqItem.name}?`)) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      await axios.post('/api/events/admin/reject-refund', { 
          eventId: reqItem.eventId, 
          sponsorId: reqItem.sponsorId 
      }, config);
      
      alert("Refund Request Rejected.");
      window.location.reload();
    } catch (error) { 
      alert("Error rejecting refund"); 
    }
  };

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ffedd5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0, color: '#c2410c' }}>💸 Manage Refund Requests</h2>
        <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', background: 'white', color: '#c2410c', border: '1px solid #c2410c', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            ⬅️ Back to Dashboard
        </button>
      </div>

      {loading ? (
          <div style={{textAlign:'center', marginTop:'50px', color:'#666'}}>Loading Requests...</div>
      ) : requests.length === 0 ? (
          <div style={{textAlign:'center', padding:'50px', background:'white', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'3rem'}}>✅</div>
              <h3 style={{color:'#1e293b'}}>No Pending Refunds</h3>
              <p style={{color:'#64748b'}}>All accounts are settled.</p>
          </div>
      ) : (
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '15px', color: '#475569' }}>Sponsor Profile</th>
                  <th style={{ padding: '15px', color: '#475569' }}>Event & Amount</th>
                  <th style={{ padding: '15px', color: '#475569' }}>Note / Comment</th>
                  <th style={{ padding: '15px', color: '#475569', textAlign:'center' }}>Proof</th>
                  <th style={{ padding: '15px', color: '#475569', textAlign:'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    
                    {/* 1. SPONSOR DETAILS (Company Name Dikhaya) */}
                    <td style={{ padding: '15px' }}>
                        <div style={{fontWeight:'bold', color:'#1e293b'}}>{req.name}</div>
                        <div style={{fontSize:'0.85rem', color:'#d97706', fontWeight:'bold', marginTop:'3px'}}>🏢 {req.companyName}</div>
                        <div style={{fontSize:'0.8rem', color:'#64748b'}}>{req.email}</div>
                    </td>

                    {/* 2. EVENT & AMOUNT */}
                    <td style={{ padding: '15px' }}>
                        <div style={{fontWeight:'bold', color:'#334155'}}>{req.eventTitle}</div>
                        <div style={{color:'#ef4444', fontWeight:'bold', fontSize:'1.1rem', marginTop:'5px'}}>₹{req.amount}</div>
                    </td>

                    {/* 3. COMMENT BOX (Admin ko dikhega ki kyu paisa diya tha) */}
                    <td style={{ padding: '15px', maxWidth:'280px' }}>
                        {req.comment ? (
                            <div style={{background:'#fffbeb', padding:'10px', borderRadius:'6px', border:'1px dashed #fcd34d', fontSize:'0.9rem', color:'#92400e', fontStyle:'italic'}}>
                                "{req.comment}"
                            </div>
                        ) : (
                            <span style={{color:'#cbd5e1', fontStyle:'italic'}}>No comment provided</span>
                        )}
                    </td>
                    
                    {/* 4. VIEW AGREEMENT */}
                    <td style={{ padding: '15px', textAlign:'center' }}>
                        <button 
                            onClick={() => navigate(`/agreement/${req.eventId}?sponsorId=${req.sponsorId}`)}
                            style={{background:'#3b82f6', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight:'bold'}}
                        >
                            📄 View Doc
                        </button>
                    </td>

                    {/* 5. ACTIONS */}
                    <td style={{ padding: '15px', textAlign:'center' }}>
                        <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                            <button onClick={() => handleApprove(req)} style={{background:'#16a34a', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer', fontWeight:'bold'}}>
                                Approve
                            </button>
                            <button onClick={() => handleReject(req)} style={{background:'#ef4444', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer', fontWeight:'bold'}}>
                                Reject
                            </button>
                        </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
      )}
    </div>
  );
};
export default AdminRefunds;