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
        const res = await axios.get('/api/events');
        
        // Filter Logic (Safe Check Added)
        const activeRequests = [];
        res.data.forEach(event => {
            // Agar sponsors array exist karta hai tabhi check karo
            if (event.sponsors && event.sponsors.length > 0) {
                event.sponsors.forEach(s => {
                    if (s.status === 'refund_requested') {
                        activeRequests.push({
                            eventId: event._id,
                            eventTitle: event.title,
                            sponsorId: s.sponsorId,
                            name: s.name,
                            email: s.email,
                            amount: s.amount
                        });
                    }
                });
            }
        });

        setRequests(activeRequests);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching refunds:", error);
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (reqItem) => {
    if(!window.confirm(`✅ Approve refund of ₹${reqItem.amount}? Money will be deducted.`)) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events/admin/approve-refund', { eventId: reqItem.eventId, sponsorId: reqItem.sponsorId }, config);
      alert("Refund Successful!");
      window.location.reload();
    } catch (error) { alert("Error approving refund"); }
  };

  const handleReject = async (reqItem) => {
    if(!window.confirm(`❌ Reject refund? Status will revert.`)) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events/admin/reject-refund', { eventId: reqItem.eventId, sponsorId: reqItem.sponsorId }, config);
      alert("Refund Rejected.");
      window.location.reload();
    } catch (error) { alert("Error rejecting refund"); }
  };

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      
      {/* HEADER */}
      <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ffedd5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0, color: '#c2410c', display:'flex', alignItems:'center', gap:'10px' }}>
            💸 Refund Management
        </h2>
        <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', background: 'white', color: '#c2410c', border: '1px solid #c2410c', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            ⬅️ Back to Dashboard
        </button>
      </div>

      {/* CONTENT */}
      {loading ? (
          <div style={{textAlign:'center', marginTop:'50px'}}>Loading Requests...</div>
      ) : requests.length === 0 ? (
          // EMPTY STATE
          <div style={{textAlign:'center', padding:'50px', background:'white', borderRadius:'15px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)'}}>
              <div style={{fontSize:'3rem'}}>✅</div>
              <h3 style={{color:'#1e293b'}}>No Pending Refunds</h3>
              <p style={{color:'#64748b'}}>All accounts are settled.</p>
              <button onClick={() => navigate('/admin')} style={{marginTop:'10px', padding:'10px 20px', background:'#3b82f6', color:'white', border:'none', borderRadius:'5px', cursor:'pointer'}}>Go Home</button>
          </div>
      ) : (
          // TABLE VIEW
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                  <th style={{ padding: '15px', color: '#475569' }}>Sponsor Name</th>
                  <th style={{ padding: '15px', color: '#475569' }}>Event</th>
                  <th style={{ padding: '15px', color: '#475569' }}>Refund Amount</th>
                  <th style={{ padding: '15px', color: '#475569', textAlign:'center' }}>Proof</th>
                  <th style={{ padding: '15px', color: '#475569', textAlign:'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req, index) => (
                  <tr key={index} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px' }}>
                        <strong>{req.name}</strong><br/>
                        <span style={{fontSize:'0.8rem', color:'#64748b'}}>{req.email}</span>
                    </td>
                    <td style={{ padding: '15px' }}>{req.eventTitle}</td>
                    <td style={{ padding: '15px', color:'#ef4444', fontWeight:'bold' }}>₹{req.amount}</td>
                    
                    {/* VIEW PROOF BUTTON */}
                    <td style={{ padding: '15px', textAlign:'center' }}>
                        <button 
                            onClick={() => navigate(`/agreement/${req.eventId}?sponsorId=${req.sponsorId}`)}
                            style={{background:'#3b82f6', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer', fontSize:'0.8rem'}}
                        >
                            📄 Receipt
                        </button>
                    </td>

                    {/* ACTION BUTTONS */}
                    <td style={{ padding: '15px', textAlign:'center', display:'flex', gap:'10px', justifyContent:'center' }}>
                        <button onClick={() => handleApprove(req)} style={{background:'#16a34a', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer', fontSize:'0.8rem'}}>
                            ✅ Approve
                        </button>
                        <button onClick={() => handleReject(req)} style={{background:'#ef4444', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer', fontSize:'0.8rem'}}>
                            ❌ Reject
                        </button>
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