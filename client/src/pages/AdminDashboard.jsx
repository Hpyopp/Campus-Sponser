import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('pending_users'); 
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [uRes, eRes] = await Promise.all([
          axios.get('/api/users/all', config),
          axios.get('/api/events/admin/all', config)
      ]);
      setUsers(uRes.data);
      setEvents(eRes.data);
    } catch (e) { toast.error("Sync Failed!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (url, msg) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      await axios.put(url, {}, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success(msg);
      fetchData();
    } catch (e) { toast.error("Action Failed!"); }
  };

  const refundReqs = [];
  events.forEach(e => e.sponsors?.forEach(s => s.status === 'refund_requested' && refundReqs.push({...s, eventId: e._id, eventTitle: e.title})));

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Poppins', padding: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>⚡ GOD MODE PANEL</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
            <Stat n={events.filter(e=>!e.isApproved).length} label="PENDING EVENTS" color="#facc15" />
            <Stat n={refundReqs.length} label="REFUNDS" color="#ef4444" />
            <button onClick={()=>{localStorage.removeItem('user'); navigate('/login');}} style={logoutBtn}>LOGOUT</button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '30px', flexWrap:'wrap' }}>
        <Tab active={view==='pending_users'} onClick={()=>setView('pending_users')} label="👥 Pending Users" color="#eab308" />
        <Tab active={view==='pending_events'} onClick={()=>setView('pending_events')} label={`🚀 Pending Events (${events.filter(e=>!e.isApproved).length})`} color="#38bdf8" />
        <Tab active={view==='refunds'} onClick={()=>setView('refunds')} label={`💸 Refunds (${refundReqs.length})`} color="#ef4444" />
        <Tab active={view==='all'} onClick={()=>setView('all')} label="🌐 System All" color="#6366f1" />
      </div>

      <div style={{ background: '#1e293b', borderRadius: '15px', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#334155', color: '#cbd5e1', fontSize: '0.85rem' }}>
                <tr>
                    <th style={{ padding: '20px' }}>Details</th>
                    <th style={{ padding: '20px' }}>Identity/Organizer</th>
                    <th style={{ padding: '20px' }}>Proof</th>
                    <th style={{ padding: '20px' }}>GOD ACTIONS</th>
                </tr>
            </thead>
            <tbody>
                {view === 'pending_events' && events.filter(e=>!e.isApproved).map(e => (
                    <tr key={e._id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '20px' }}><strong>{e.title}</strong><br/><span style={{fontSize:'0.8rem', color:'#94a3b8'}}>Budget: ₹{e.budget}</span></td>
                        <td style={{ padding: '20px' }}>{e.user?.name} (Student)</td>
                        <td style={{ padding: '20px' }}>{e.permissionLetter ? <a href={e.permissionLetter} target="_blank" style={linkBtn}>View Letter</a> : "No Doc"}</td>
                        <td style={{ padding: '20px' }}>
                            <button onClick={()=>handleAction(`/api/events/${e._id}/approve`, "Event Live! 🚀")} style={actionBtn('#16a34a')}>APPROVE</button>
                        </td>
                    </tr>
                ))}
                {view === 'pending_users' && users.filter(u=>!u.isVerified).map(u => (
                    <tr key={u._id} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '20px' }}><strong>{u.name}</strong><br/>{u.email}</td>
                        <td style={{ padding: '20px' }}>{u.role.toUpperCase()}</td>
                        <td style={{ padding: '20px' }}>{u.verificationDoc ? <a href={u.verificationDoc} target="_blank" style={linkBtn}>View ID</a> : "No Doc"}</td>
                        <td style={{ padding: '20px' }}><button onClick={()=>handleAction(`/api/users/${u._id}/approve`, "User Verified!")} style={actionBtn('#16a34a')}>APPROVE</button></td>
                    </tr>
                ))}
                {view === 'refunds' && refundReqs.map((r, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                        <td style={{ padding: '20px' }}><strong>{r.name}</strong><br/>Amt: ₹{r.amount}</td>
                        <td style={{ padding: '20px', color: '#38bdf8' }}>{r.eventTitle}</td>
                        <td style={{ padding: '20px' }}>Verified Sponsor</td>
                        <td style={{ padding: '20px' }}><button onClick={()=>handleAction(`/api/events/${r.eventId}/process-refund`, "Refunded!")} style={actionBtn('#ef4444')}>PROCESS REFUND</button></td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
};

const Stat = ({n, label, color}) => (<div style={{textAlign:'right'}}><div style={{fontSize:'1.5rem', fontWeight:'bold', color}}>{n}</div><div style={{fontSize:'0.7rem', color:'#94a3b8'}}>{label}</div></div>);
const Tab = ({active, onClick, label, color}) => (<button onClick={onClick} style={{padding:'10px 20px', borderRadius:'8px', background: active ? `${color}20` : '#1e293b', border: active ? `2px solid ${color}` : 'none', color: active ? color : '#94a3b8', cursor:'pointer', fontWeight:'bold'}}>{label}</button>);
const actionBtn = (bg) => ({ padding:'8px 15px', background:bg, color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.75rem' });
const linkBtn = { color: '#38bdf8', textDecoration: 'none', fontWeight: 'bold', border: '1px solid #38bdf8', padding: '5px 8px', borderRadius: '5px' };
const logoutBtn = { background:'#ef4444', color:'white', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' };

export default AdminDashboard;