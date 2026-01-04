import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('pending'); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') return navigate('/login');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // Load Users & Events
      const [userRes, eventRes] = await Promise.all([
          axios.get('/api/users/all', config),
          axios.get('/api/events', config)
      ]);
      setUsers(userRes.data);
      setEvents(eventRes.data);
    } catch (error) {
      toast.error("Database Connection Failed!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const executeAction = async (id, actionType, extraData = {}) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      if (actionType === 'approve') await axios.put(`/api/users/${id}/approve`, {}, config);
      if (actionType === 'revoke') await axios.put(`/api/users/${id}/unverify`, {}, config);
      if (actionType === 'delete') {
          if(window.confirm("⚠️ DELETE PERMANENTLY?")) await axios.delete(`/api/users/${id}`, config);
      }
      // 👇 REFUND PROCESS LOGIC
      if (actionType === 'process_refund') {
          if(window.confirm("✅ Confirm Refund & Remove Sponsor?")) {
              await axios.put(`/api/events/${extraData.eventId}/process-refund`, { sponsorId: id }, config);
              toast.success("Refund Processed & Sponsor Removed");
          }
      }

      toast.success("Action Executed!");
      fetchData(); 
    } catch (error) {
      toast.error("Command Failed ❌");
    }
  };

  // Logic to extract refund requests from all events
  const refundRequests = [];
  events.forEach(event => {
      event.sponsors?.forEach(s => {
          if (s.status === 'refund_requested') {
              refundRequests.push({ ...s, eventTitle: event.title, eventId: event._id });
          }
      });
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Poppins', padding: '30px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '1px solid #334155', paddingBottom: '20px' }}>
        <div>
            <h1 style={{ margin: 0, fontSize: '2rem', color: '#38bdf8' }}>⚡ GOD MODE PANEL</h1>
            <p style={{ color: '#94a3b8', margin: 0 }}>Absolute Control Center</p>
        </div>
        <div style={{ display: 'flex', gap: '20px' }}>
            <Stat n={refundRequests.length} label="REFUNDS" color="#ef4444" />
            <Stat n={users.filter(u => !u.isVerified).length} label="PENDING" color="#facc15" />
            <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} style={logoutBtn}>LOGOUT</button>
        </div>
      </div>

      {/* GOD TABS */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
        <Tab active={view === 'pending'} onClick={() => setView('pending')} label="⚠️ Pending Approvals" color="#eab308" />
        <Tab active={view === 'refunds'} onClick={() => setView('refunds')} label={`💸 Refund Requests (${refundRequests.length})`} color="#ef4444" />
        <Tab active={view === 'all'} onClick={() => setView('all')} label="👥 All Users" color="#6366f1" />
      </div>

      {/* DATA TABLE */}
      <div style={{ background: '#1e293b', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#334155', color: '#cbd5e1', textTransform: 'uppercase', fontSize: '0.85rem' }}>
                <tr>
                    <th style={{ padding: '20px' }}>{view === 'refunds' ? 'Sponsor Details' : 'User Identity'}</th>
                    <th style={{ padding: '20px' }}>{view === 'refunds' ? 'Event' : 'Role'}</th>
                    <th style={{ padding: '20px' }}>Status</th>
                    <th style={{ padding: '20px' }}>GOD ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {view === 'refunds' ? (
                    refundRequests.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{fontWeight:'bold'}}>{r.name} ({r.companyName})</div>
                                <div style={{fontSize:'0.8rem', color:'#94a3b8'}}>Amount: ₹{r.amount}</div>
                            </td>
                            <td style={{ padding: '20px', color: '#38bdf8' }}>{r.eventTitle}</td>
                            <td style={{ padding: '20px', color: '#ef4444', fontWeight: 'bold' }}>REFUND REQ</td>
                            <td style={{ padding: '20px' }}>
                                <div style={{display:'flex', gap:'10px'}}>
                                    <button onClick={() => navigate(`/agreement/${r.eventId}?sponsorId=${r.sponsorId}`)} style={actionBtn('#2563eb')}>📄 VIEW DOC</button>
                                    <button onClick={() => executeAction(r.sponsorId, 'process_refund', {eventId: r.eventId})} style={actionBtn('#ef4444')}>💰 PROCESS REFUND</button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    // Logic for Users View (Pending/All)
                    users.filter(u => view === 'all' ? true : !u.isVerified).map(user => (
                        <tr key={user._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}>
                                <div style={{ fontWeight: 'bold' }}>{user.name}</div>
                                <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{user.email}</div>
                            </td>
                            <td style={{ padding: '20px' }}>{user.role.toUpperCase()}</td>
                            <td style={{ padding: '20px' }}>{user.isVerified ? '✅' : '⏳'}</td>
                            <td style={{ padding: '20px' }}>
                                <div style={{ display: 'flex', gap: '10px' }}>
                                    {!user.isVerified ? <button onClick={() => executeAction(user._id, 'approve')} style={actionBtn('#16a34a')}>APPROVE</button> : <button onClick={() => executeAction(user._id, 'revoke')} style={actionBtn('#f59e0b')}>REVOKE</button>}
                                    <button onClick={() => executeAction(user._id, 'delete')} style={actionBtn('#ef4444')}>DEL</button>
                                </div>
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat = ({n, label, color}) => (<div style={{textAlign:'right'}}><div style={{fontSize:'1.5rem', fontWeight:'bold', color}}>{n}</div><div style={{fontSize:'0.7rem', color:'#94a3b8'}}>{label}</div></div>);
const Tab = ({active, onClick, label, color}) => (<button onClick={onClick} style={{padding:'10px 20px', borderRadius:'8px', border: active ? `2px solid ${color}` : 'none', background: active ? `${color}20` : '#1e293b', color: active ? color : '#94a3b8', cursor:'pointer', fontWeight:'bold'}}>{label}</button>);
const actionBtn = (bg) => ({ padding:'6px 12px', background:bg, color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.75rem' });
const logoutBtn = { background:'#ef4444', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' };

export default AdminDashboard;