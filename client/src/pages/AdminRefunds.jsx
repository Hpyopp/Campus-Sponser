import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminRefunds = () => {
  const [requests, setRequests] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/events');
      const activeRequests = [];
      res.data.forEach(event => {
          event.sponsors.forEach(s => {
              if (s.status === 'refund_requested') {
                  activeRequests.push({ eventId: event._id, eventTitle: event.title, sponsorId: s.sponsorId, name: s.name, email: s.email, amount: s.amount });
              }
          });
      });
      setRequests(activeRequests);
    } catch (error) { console.error(error); }
  };

  const handleApprove = async (reqItem) => {
    if(!window.confirm("Approve Refund? Money will be deducted.")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events/admin/approve-refund', { eventId: reqItem.eventId, sponsorId: reqItem.sponsorId }, config);
      alert("✅ Refund Approved!"); fetchRequests();
    } catch (error) { alert("Error"); }
  };

  const handleReject = async (reqItem) => {
    if(!window.confirm("Reject Refund?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('/api/events/admin/reject-refund', { eventId: reqItem.eventId, sponsorId: reqItem.sponsorId }, config);
      alert("❌ Refund Rejected."); fetchRequests();
    } catch (error) { alert("Error"); }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '40px auto', padding: '30px', fontFamily: 'Poppins' }}>
      <h2 style={{borderBottom:'2px solid #ddd', paddingBottom:'15px'}}>💸 Manage Refunds</h2>
      {requests.length === 0 ? <p>No Pending Requests</p> : requests.map((req, i) => (
          <div key={i} style={{background:'white', padding:'20px', margin:'15px 0', borderRadius:'10px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <div>
                  <h4 style={{margin:0}}>{req.name}</h4>
                  <p style={{margin:0, color:'#666'}}>Event: {req.eventTitle} | Amount: <strong>₹{req.amount}</strong></p>
              </div>
              <div style={{display:'flex', gap:'10px'}}>
                  <button onClick={() => navigate(`/agreement/${req.eventId}?sponsorId=${req.sponsorId}`)} style={{background:'#3b82f6', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer'}}>📄 View Proof</button>
                  <button onClick={() => handleApprove(req)} style={{background:'#16a34a', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Approve</button>
                  <button onClick={() => handleReject(req)} style={{background:'#ef4444', color:'white', padding:'8px 15px', borderRadius:'5px', border:'none', cursor:'pointer'}}>Reject</button>
              </div>
          </div>
      ))}
      <button onClick={() => navigate('/')} style={{marginTop:'20px'}}>Back Home</button>
    </div>
  );
};
export default AdminRefunds;