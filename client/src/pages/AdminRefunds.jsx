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
        const activeRequests = [];
        
        if (Array.isArray(res.data)) {
            res.data.forEach(event => {
                if (event.sponsors && Array.isArray(event.sponsors)) {
                    event.sponsors.forEach(s => {
                        if (s.status === 'refund_requested') {
                            activeRequests.push({
                                eventId: event._id,
                                eventTitle: event.title || 'Unknown Event',
                                sponsorId: s.sponsorId,
                                name: s.name || 'Unknown User',
                                email: s.email || 'No Email',
                                amount: s.amount || 0
                            });
                        }
                    });
                }
            });
        }
        setRequests(activeRequests);
      } catch (error) { console.error(error); } finally { setLoading(false); }
    };
    fetchRequests();
  }, []);

  const handleApprove = async (reqItem) => {
    if(!window.confirm(`✅ Approve refund of ₹${reqItem.amount}?`)) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // 👇 FIX: Send Token
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events/admin/approve-refund', { eventId: reqItem.eventId, sponsorId: reqItem.sponsorId }, config);
      alert("Success!"); window.location.reload();
    } catch (error) { alert("Error"); }
  };

  const handleReject = async (reqItem) => {
    if(!window.confirm(`❌ Reject refund?`)) return;
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      // 👇 FIX: Send Token
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events/admin/reject-refund', { eventId: reqItem.eventId, sponsorId: reqItem.sponsorId }, config);
      alert("Rejected."); window.location.reload();
    } catch (error) { alert("Error"); }
  };

  return (
    <div style={{ padding: '40px', background: '#f8fafc', minHeight: '100vh', fontFamily: 'Poppins' }}>
      <div style={{ background: '#fff7ed', padding: '20px', borderRadius: '10px', marginBottom: '30px', border: '1px solid #ffedd5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <h2 style={{ margin: 0, color: '#c2410c' }}>💸 Refund Management</h2>
        <button onClick={() => navigate('/admin')} style={{ padding: '10px 20px', background: 'white', color: '#c2410c', border: '1px solid #c2410c', borderRadius: '5px', cursor: 'pointer' }}>⬅️ Dashboard</button>
      </div>

      {loading ? <p>Loading...</p> : requests.length === 0 ? (
          <div style={{textAlign:'center', padding:'50px', background:'white', borderRadius:'15px'}}><h3>✅ No Pending Refunds</h3></div>
      ) : (
          <div style={{ background: 'white', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f1f5f9', textAlign: 'left' }}><th style={{ padding: '15px' }}>User</th><th style={{ padding: '15px' }}>Event</th><th style={{ padding: '15px' }}>Amount</th><th style={{ padding: '15px' }}>Proof</th><th style={{ padding: '15px' }}>Actions</th></tr>
              </thead>
              <tbody>
                {requests.map((req, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px' }}><strong>{req.name}</strong><br/><span style={{fontSize:'0.8rem', color:'#666'}}>{req.email}</span></td>
                    <td style={{ padding: '15px' }}>{req.eventTitle}</td>
                    <td style={{ padding: '15px', color:'red', fontWeight:'bold' }}>₹{req.amount}</td>
                    <td style={{ padding: '15px' }}><button onClick={() => navigate(`/agreement/${req.eventId}?sponsorId=${req.sponsorId}`)} style={{background:'#3b82f6', color:'white', padding:'5px 10px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Receipt</button></td>
                    <td style={{ padding: '15px', display:'flex', gap:'10px' }}>
                        <button onClick={() => handleApprove(req)} style={{background:'#16a34a', color:'white', padding:'5px 10px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Approve</button>
                        <button onClick={() => handleReject(req)} style={{background:'#ef4444', color:'white', padding:'5px 10px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Reject</button>
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