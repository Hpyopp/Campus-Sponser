import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { jsPDF } from "jspdf";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('pending_users'); 
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const navigate = useNavigate();

  // Silence Console Error (Recharts issue)
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === "string" && /width\(/.test(args[0])) return;
      originalError(...args);
    };
    return () => { console.error = originalError; }; 
  }, []);

  const fetchData = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') return navigate('/login');
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      const [uRes, eRes] = await Promise.all([
          axios.get('https://campus-sponser-api.onrender.com/api/users/all', config),
          axios.get('https://campus-sponser-api.onrender.com/api/events/admin/all', config)
      ]);
      setUsers(uRes.data);
      setEvents(eRes.data);
      setTimeout(() => setChartReady(true), 500); 
    } catch (e) { toast.error("Sync Failed!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (url, method, msg, body = {}) => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      method === 'delete' ? await axios.delete(url, config) : await axios.put(url, body, config);
      toast.success(msg);
      fetchData(); // Refresh Data
    } catch (e) { toast.error("Command Failed!"); }
  };

  // 🗑️ DELETE WRAPPER (Safety Check)
  const confirmDelete = (id) => {
      if(window.confirm("Are you sure you want to PERMANENTLY delete this user?")) {
          handleAction(`https://campus-sponser-api.onrender.com/api/users/${id}`, 'delete', "User Deleted Successfully 🗑️");
      }
  };

  // Generate Agreement PDF
  const viewAgreement = (s, eventTitle) => {
      const doc = new jsPDF();
      doc.setFontSize(22);
      doc.text("Sponsorship Agreement (Admin View)", 20, 20);
      doc.setFontSize(12);
      doc.text(`Sponsor: ${s.companyName} (${s.name})`, 20, 40);
      doc.text(`Event: ${eventTitle}`, 20, 50);
      doc.text(`Amount: INR ${s.amount}`, 20, 60);
      doc.text(`Payment ID: ${s.paymentId}`, 20, 70);
      doc.text(`Status: ${s.status.toUpperCase()}`, 20, 80);
      window.open(doc.output('bloburl'), '_blank');
  };

  // EXTRACT DATA
  const refundReqs = [];
  const allPayments = [];

  events.forEach(e => {
      e.sponsors?.forEach(s => {
          if (s.status === 'verified' || s.status === 'refund_requested') {
              allPayments.push({...s, eventId: e._id, eventTitle: e.title});
          }
          if (s.status === 'refund_requested') {
              refundReqs.push({...s, eventId: e._id, eventTitle: e.title});
          }
      });
  });

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const userStats = [
    { name: 'Students', value: users.filter(u => u.role === 'student').length, color: '#3b82f6' },
    { name: 'Sponsors', value: users.filter(u => u.role === 'sponsor').length, color: '#f59e0b' },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#ef4444' }
  ];

  const eventStats = [
    { name: 'Approved', count: events.filter(e => e.isApproved).length },
    { name: 'Pending', count: events.filter(e => !e.isApproved).length }
  ];

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Poppins', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>⚡ GOD MODE PANEL</h1>
        <div style={{ display: 'flex', gap: '15px' }}>
            <Stat n={events.filter(e=>!e.isApproved).length} label="PENDING EVENTS" color="#38bdf8" />
            <Stat n={refundReqs.length} label="REFUND REQS" color="#ef4444" />
            <button onClick={()=>{localStorage.removeItem('user'); navigate('/login');}} style={logoutBtn}>LOGOUT</button>
        </div>
      </div>

      {/* CHARTS (Wait for data) */}
      {!loading && chartReady && users.length > 0 && (
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', flex: '1 1 300px', maxWidth: '400px', minWidth: '0' }}>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <PieChart>
                            <Pie data={userStats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                {userStats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                            </Pie>
                            <Tooltip contentStyle={{background:'#334155', border:'none', color:'white'}} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                  </div>
              </div>
              <div style={{ background: '#1e293b', padding: '20px', borderRadius: '15px', flex: '1 1 300px', maxWidth: '500px', minWidth: '0' }}>
                  <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer width="99%" height="100%">
                        <BarChart data={eventStats}>
                            <XAxis dataKey="name" stroke="#cbd5e1" />
                            <Tooltip cursor={{fill: '#334155'}} contentStyle={{background:'#1e293b', border:'1px solid #475569', color:'white'}} />
                            <Bar dataKey="count" fill="#38bdf8" barSize={50} radius={[5, 5, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                  </div>
              </div>
          </div>
      )}

      {/* TABS */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap:'wrap' }}>
        <Tab active={view==='pending_users'} onClick={()=>setView('pending_users')} label="👥 Pending Users" color="#eab308" />
        <Tab active={view==='pending_events'} onClick={()=>setView('pending_events')} label="🚀 Events" color="#38bdf8" />
        <Tab active={view==='refunds'} onClick={()=>setView('refunds')} label={`💸 Refunds (${refundReqs.length})`} color="#ef4444" />
        <Tab active={view==='history'} onClick={()=>setView('history')} label={`📜 History`} color="#16a34a" />
        <Tab active={view==='all_users'} onClick={()=>setView('all_users')} label={`🌐 All Users`} color="#6366f1" />
      </div>

      {view === 'all_users' && <input type="text" placeholder="Search by Name or Email..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} style={searchInput} />}

      {/* TABLE */}
      <div style={{ background: '#1e293b', borderRadius: '15px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}> 
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                <thead style={{ background: '#334155', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    <tr>
                        <th style={{ padding: '20px' }}>INFO</th>
                        <th style={{ padding: '20px' }}>DETAILS</th>
                        <th style={{ padding: '20px' }}>DOCS</th>
                        <th style={{ padding: '20px' }}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {/* 1. REFUNDS VIEW */}
                    {view === 'refunds' && refundReqs.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}><div style={{fontWeight:'bold'}}>{r.name}</div><div style={{color:'#f87171'}}>Refund: ₹{r.amount}</div></td>
                            <td style={{ padding: '20px', color:'#38bdf8' }}>{r.eventTitle}</td>
                            <td style={{ padding: '20px' }}><button onClick={() => viewAgreement(r, r.eventTitle)} style={linkBtn}>📄 Agreement</button></td>
                            <td style={{ padding: '20px' }}><button onClick={()=>handleAction(`https://campus-sponser-api.onrender.com/api/events/${r.eventId}/process-refund`, 'put', "Refund Processed!", {sponsorId: r.sponsorId})} style={actionBtn('#ef4444')}>APPROVE REFUND</button></td>
                        </tr>
                    ))}

                    {/* 2. HISTORY VIEW */}
                    {view === 'history' && allPayments.map((r, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}><div style={{fontWeight:'bold'}}>{r.name}</div><div style={{color:'#4ade80'}}>Paid: ₹{r.amount}</div></td>
                            <td style={{ padding: '20px' }}>{r.eventTitle}</td>
                            <td style={{ padding: '20px' }}><button onClick={() => viewAgreement(r, r.eventTitle)} style={linkBtn}>📄 View</button></td>
                            <td style={{ padding: '20px', fontSize:'0.8rem', color:'#94a3b8' }}>ID: {r.paymentId}</td>
                        </tr>
                    ))}

                    {/* 3. PENDING EVENTS */}
                    {view === 'pending_events' && events.filter(e=>!e.isApproved).map(e => (
                        <tr key={e._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}><strong>{e.title}</strong><br/>Budget: ₹{e.budget}</td>
                            <td style={{ padding: '20px' }}>{e.user?.name}</td>
                            <td style={{ padding: '20px' }}>{e.permissionLetter ? <a href={e.permissionLetter} target="_blank" style={linkBtn}>View Doc</a> : "No Doc"}</td>
                            <td style={{ padding: '20px' }}><button onClick={()=>handleAction(`https://campus-sponser-api.onrender.com/api/events/${e._id}/approve`, 'put', "Approved!")} style={actionBtn('#16a34a')}>APPROVE</button></td>
                        </tr>
                    ))}
                    
                    {/* 4. PENDING USERS (With DELETE) */}
                    {view === 'pending_users' && users.filter(u=>!u.isVerified).map(u => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}><strong>{u.name}</strong><br/>{u.email}</td>
                            <td style={{ padding: '20px' }}>{u.role.toUpperCase()}</td>
                            <td style={{ padding: '20px' }}>{u.verificationDoc ? <a href={u.verificationDoc} target="_blank" style={linkBtn}>View ID</a> : "No Doc"}</td>
                            <td style={{ padding: '20px', display:'flex', gap:'10px' }}>
                                <button onClick={()=>handleAction(`https://campus-sponser-api.onrender.com/api/users/${u._id}/approve`, 'put', "Verified!")} style={actionBtn('#16a34a')}>APPROVE</button>
                                <button onClick={()=>confirmDelete(u._id)} style={actionBtn('#ef4444')}>🗑️ DELETE</button>
                            </td>
                        </tr>
                    ))}

                    {/* 5. ALL USERS (NEW FIX: List all + Delete) */}
                    {view === 'all_users' && filteredUsers.map(u => (
                        <tr key={u._id} style={{ borderBottom: '1px solid #334155' }}>
                            <td style={{ padding: '20px' }}>
                                <strong>{u.name}</strong><br/>{u.email}
                            </td>
                            <td style={{ padding: '20px' }}>
                                <span style={{color: u.role==='student' ? '#38bdf8' : '#f59e0b', fontWeight:'bold'}}>{u.role.toUpperCase()}</span>
                            </td>
                            <td style={{ padding: '20px' }}>
                                {u.isVerified ? <span style={{color:'#4ade80'}}>✅ Verified</span> : <span style={{color:'#facc15'}}>⏳ Pending</span>}
                            </td>
                            <td style={{ padding: '20px' }}>
                                <button onClick={()=>confirmDelete(u._id)} style={actionBtn('#ef4444')}>🗑️ DELETE</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const Stat = ({n, label, color}) => (<div style={{textAlign:'right'}}><div style={{fontSize:'1.5rem', fontWeight:'bold', color}}>{n}</div><div style={{fontSize:'0.7rem', color:'#94a3b8'}}>{label}</div></div>);
const Tab = ({active, onClick, label, color}) => (<button onClick={onClick} style={{padding:'10px 15px', borderRadius:'8px', background: active ? `${color}20` : '#1e293b', border: active ? `2px solid ${color}` : 'none', color: active ? color : '#94a3b8', cursor:'pointer', fontWeight:'bold', fontSize:'0.9rem'}}>{label}</button>);
const actionBtn = (bg) => ({ padding:'8px 10px', background:bg, color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.75rem' });
const linkBtn = { color: '#38bdf8', background:'transparent', border: '1px solid #38bdf8', padding: '5px 8px', borderRadius: '5px', cursor:'pointer', textDecoration:'none', fontSize:'0.75rem', fontWeight:'bold' };
const logoutBtn = { background:'#ef4444', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.8rem' };
const searchInput = { width: '100%', padding: '12px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: 'white', marginBottom: '20px', outline: 'none' };

export default AdminDashboard;