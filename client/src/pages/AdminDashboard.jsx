import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { generateMOU } from '../utils/generateMOU'; 

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [reports, setReports] = useState([]); 
  const [view, setView] = useState('reports'); 
  const [loading, setLoading] = useState(true);
  const [chartReady, setChartReady] = useState(false);
  const navigate = useNavigate();

  // Silence Recharts warnings
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
      
      const [uRes, eRes, rRes] = await Promise.all([
          axios.get('https://campus-sponser-api.onrender.com/api/users/all', config),
          axios.get('https://campus-sponser-api.onrender.com/api/events/admin/all', config),
          axios.get('https://campus-sponser-api.onrender.com/api/reports', config)
      ]);
      setUsers(uRes.data);
      setEvents(eRes.data);
      setReports(rRes.data);
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
      fetchData(); 
    } catch (e) { toast.error("Action Failed!"); }
  };

  // Instant Delete Logic for Reports
  const resolveReport = async (id) => {
    if(!window.confirm("Mark this report as resolved?")) return;
    
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        
        await axios.delete(`https://campus-sponser-api.onrender.com/api/reports/${id}`, config);
        setReports(prevReports => prevReports.filter(report => report._id !== id));
        
        toast.success("Report Resolved ✅");
    } catch (e) {
        toast.error("Failed to resolve report");
    }
  };

  // Generate Professional MOU
  const viewAgreement = (s, fullEvent) => {
      if (!fullEvent) {
          toast.error("Event details missing!");
          return;
      }
      generateMOU(s, fullEvent); 
      toast.success("MOU Generated Successfully! 📄");
  };

  const shareWhatsApp = (id, title) => {
    const link = `${window.location.origin}/event/${id}`;
    const text = `Check out this event: ${title} - ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyLink = (id) => {
    navigator.clipboard.writeText(`${window.location.origin}/event/${id}`);
    toast.success("Link Copied! 🔗");
  };

  // --- STATS LOGIC ---
  const userStats = [
    { name: 'Students', value: users.filter(u => u.role === 'student').length, color: '#3b82f6' },
    { name: 'Sponsors', value: users.filter(u => u.role === 'sponsor').length, color: '#f59e0b' },
    { name: 'Admins', value: users.filter(u => u.role === 'admin').length, color: '#ef4444' }
  ];

  const eventStats = [
    { name: 'Approved', count: events.filter(e => e.isApproved).length },
    { name: 'Pending', count: events.filter(e => !e.isApproved).length }
  ];

  const roleComparisonStats = [
    { name: 'Students', count: users.filter(u => u.role === 'student').length, fill: '#3b82f6' },
    { name: 'Sponsors', count: users.filter(u => u.role === 'sponsor').length, fill: '#f59e0b' }
  ];

  const allPayments = [];
  events.forEach(e => {
      e.sponsors?.forEach(s => {
          if (s.status === 'verified') allPayments.push({...s, eventTitle: e.title, fullEvent: e});
      });
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: 'white', fontFamily: 'Poppins', padding: '20px' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', borderBottom: '1px solid #334155', paddingBottom: '20px', marginBottom: '30px' }}>
        <h1 style={{ color: '#38bdf8', margin: 0 }}>⚡ GOD MODE PANEL</h1>
        <div style={{ display: 'flex', gap: '20px' }}>
            <div style={{textAlign:'right'}}>
                <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#ef4444'}}>{reports.length}</div>
                <div style={{fontSize:'0.7rem', color:'#94a3b8'}}>REPORTS</div>
            </div>
            <div style={{textAlign:'right'}}>
                <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#38bdf8'}}>{events.filter(e=>!e.isApproved).length}</div>
                <div style={{fontSize:'0.7rem', color:'#94a3b8'}}>PENDING</div>
            </div>
            <button onClick={()=>{localStorage.clear(); navigate('/login');}} style={logoutBtn}>LOGOUT</button>
        </div>
      </div>

      {/* 📊 CHARTS SECTION */}
      {!loading && chartReady && (
          <div style={{ display: 'flex', gap: '20px', marginBottom: '40px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <div style={chartCard}>
                <h3 style={{textAlign:'center', fontSize:'0.9rem', color:'#94a3b8'}}>Role Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <PieChart><Pie data={userStats} innerRadius={60} outerRadius={80} dataKey="value">{userStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}</Pie><Tooltip contentStyle={{backgroundColor:'#1e293b', border:'none', borderRadius:'10px'}}/><Legend/></PieChart>
                </ResponsiveContainer>
              </div>
              <div style={chartCard}>
                <h3 style={{textAlign:'center', fontSize:'0.9rem', color:'#94a3b8'}}>Event Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={eventStats}><XAxis dataKey="name" stroke="#ccc"/><Tooltip contentStyle={{backgroundColor:'#1e293b', border:'none', borderRadius:'10px'}} cursor={{fill:'transparent'}}/><Bar dataKey="count" fill="#38bdf8" radius={[5,5,0,0]} barSize={50}/></BarChart>
                </ResponsiveContainer>
              </div>
              <div style={chartCard}>
                <h3 style={{textAlign:'center', fontSize:'0.9rem', color:'#94a3b8'}}>Students vs Sponsors</h3>
                <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={roleComparisonStats}><XAxis dataKey="name" stroke="#ccc"/><Tooltip contentStyle={{backgroundColor:'#1e293b', border:'none', borderRadius:'10px'}} cursor={{fill:'transparent'}}/><Bar dataKey="count" radius={[5,5,0,0]} barSize={50}>{roleComparisonStats.map((entry, index) => (<Cell key={`cell-${index}`} fill={entry.fill} />))}</Bar></BarChart>
                </ResponsiveContainer>
              </div>
          </div>
      )}

      {/* TAB NAVIGATION */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap:'wrap' }}>
        <Tab active={view==='reports'} onClick={()=>setView('reports')} label={`🚩 Reports (${reports.length})`} color="#ef4444" />
        <Tab active={view==='pending_users'} onClick={()=>setView('pending_users')} label="👥 Pending KYC" color="#eab308" />
        <Tab active={view==='events'} onClick={()=>setView('events')} label="🚀 Events Control" color="#38bdf8" />
        <Tab active={view==='history'} onClick={()=>setView('history')} label="📜 History" color="#16a34a" />
        <Tab active={view==='all_users'} onClick={()=>setView('all_users')} label="🌐 All Users" color="#6366f1" />
      </div>

      {/* MAIN CONTENT TABLE/GRID */}
      <div style={{ background: '#1e293b', borderRadius: '15px', padding: '20px' }}>
        
        {/* REPORTS SECTION */}
        {view === 'reports' && (
            <div style={{overflowX:'auto'}}>
                 {reports.length === 0 ? (
                    <div style={{textAlign:'center', padding:'40px', color:'#94a3b8'}}>No reports found. 🎉</div>
                 ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{textAlign:'left', color:'#94a3b8', fontSize:'0.8rem', background:'#334155'}}><tr style={{borderBottom:'2px solid #475569'}}><th style={{padding:'15px'}}>REPORTED EVENT</th><th style={{padding:'15px'}}>REPORTED BY</th><th style={{padding:'15px'}}>REASON</th><th style={{padding:'15px'}}>ACTIONS</th></tr></thead>
                        <tbody>
                            {reports.map((r, i) => (
                                <tr key={r._id || i} style={{borderBottom:'1px solid #334155'}}>
                                    <td style={{padding:'15px'}}>
                                        <b style={{color:'white'}}>{r.event?.title || "Deleted Event"}</b>
                                        <br/><small style={{color:'#64748b'}}>ID: {r.event?._id}</small>
                                    </td>
                                    <td style={{padding:'15px'}}>
                                        {r.reportedBy?.name}
                                        <br/><small style={{color:'#64748b'}}>{r.reportedBy?.email}</small>
                                    </td>
                                    <td style={{padding:'15px', color:'#fca5a5', fontWeight:'bold'}}>
                                        "{r.reason}"
                                    </td>
                                    <td style={{padding:'15px', display:'flex', gap:'10px'}}>
                                        <button onClick={()=>window.open(`/event/${r.event?._id}`, '_blank')} style={actionBtn('#38bdf8')}>VIEW EVENT 👁️</button>
                                        <button onClick={()=>resolveReport(r._id)} style={actionBtn('#16a34a')}>RESOLVE (DELETE) ✅</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 )}
            </div>
        )}

        {/* EVENTS CONTROL */}
        {view === 'events' && (
          <div style={{ display: 'grid', gap: '20px' }}>
            {events.map(e => (
              <div key={e._id} style={{ background: '#334155', padding: '20px', borderRadius: '10px', borderLeft: e.isApproved ? '5px solid #16a34a' : '5px solid #eab308' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'flex-start' }}>
                  <div>
                    <h3 style={{margin:0}}>{e.title}</h3>
                    <p style={{fontSize:'0.8rem', color:'#94a3b8'}}>Organized by: {e.user?.name} | Goal: ₹{e.budget}</p>
                    <div style={{display:'flex', gap:'10px', marginTop:'10px'}}>
                        <button onClick={()=>shareWhatsApp(e._id, e.title)} style={actionBtn('#16a34a')}>WhatsApp 📱</button>
                        <button onClick={()=>copyLink(e._id)} style={actionBtn('#38bdf8')}>Copy Link 🔗</button>
                    </div>
                  </div>
                  <div style={{textAlign:'right'}}>
                      <div style={{color:'#4ade80', fontWeight:'bold', marginBottom:'10px'}}>Raised: ₹{e.raisedAmount || 0}</div>
                      {!e.isApproved && <button onClick={()=>handleAction(`https://campus-sponser-api.onrender.com/api/events/${e._id}/approve`, 'put', "Approved!")} style={actionBtn('#16a34a')}>APPROVE</button>}
                  </div>
                </div>

                {e.sponsors?.length > 0 && (
                  <div style={{marginTop:'20px', background: '#0f172a', padding: '15px', borderRadius: '8px'}}>
                    <h4 style={{margin:'0 0 10px 0', fontSize:'0.85rem', color:'#38bdf8'}}>Verified Sponsors & Payments:</h4>
                    {e.sponsors.map((s, idx) => (
                      <div key={idx} style={{display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid #1e293b'}}>
                        <span style={{fontSize:'0.9rem'}}>{s.name} ({s.companyName}) - <b style={{color:'#4ade80'}}>₹{s.amount}</b></span>
                        <button onClick={()=>viewAgreement(s, e)} style={{background:'none', border:'1px solid #38bdf8', color:'#38bdf8', borderRadius:'4px', padding:'2px 8px', cursor:'pointer', fontSize:'0.7rem'}}>VIEW AGREEMENT 📄</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* PAYMENT HISTORY */}
        {view === 'history' && (
             <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{textAlign:'left', color:'#94a3b8', fontSize:'0.8rem', background:'#334155'}}><tr style={{borderBottom:'2px solid #475569'}}><th style={{padding:'15px'}}>SPONSOR</th><th style={{padding:'15px'}}>EVENT</th><th style={{padding:'15px'}}>AMOUNT</th><th style={{padding:'15px'}}>PAYMENT ID</th><th style={{padding:'15px'}}>DOC</th></tr></thead>
                <tbody>
                    {allPayments.map((p, i) => (
                        <tr key={i} style={{borderBottom:'1px solid #334155'}}>
                            <td style={{padding:'15px'}}>{p.name}<br/><small style={{color:'#64748b'}}>{p.companyName}</small></td>
                            <td style={{padding:'15px'}}>{p.eventTitle}</td>
                            <td style={{padding:'15px', color:'#4ade80', fontWeight:'bold'}}>₹{p.amount}</td>
                            <td style={{padding:'15px', fontSize:'0.75rem', fontFamily:'monospace'}}>{p.paymentId || 'MANUAL_PAY'}</td>
                            <td style={{padding:'15px'}}><button onClick={()=>viewAgreement(p, p.fullEvent)} style={{background:'none', border:'none', color:'#38bdf8', cursor:'pointer'}}>📄 Download MOU</button></td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}

        {/* USERS TABLES (UPDATED WITH GST COLUMN) */}
        {(view === 'pending_users' || view === 'all_users') && (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{textAlign:'left', color:'#94a3b8', fontSize:'0.8rem', background:'#334155'}}>
                    <tr>
                        <th style={{padding:'15px'}}>USER INFO</th>
                        <th style={{padding:'15px'}}>ROLE</th>
                        {/* 👇 NEW COLUMN */}
                        <th style={{padding:'15px'}}>COMPANY / GST</th>
                        <th style={{padding:'15px'}}>KYC</th>
                        <th style={{padding:'15px'}}>ACTIONS</th>
                    </tr>
                </thead>
                <tbody>
                    {(view==='pending_users' ? users.filter(u=>!u.isVerified) : users).map(u => (
                        <tr key={u._id} style={{borderBottom:'1px solid #334155'}}>
                            <td style={{padding:'15px'}}>{u.name}<br/><small style={{color:'#64748b'}}>{u.email}</small></td>
                            <td style={{padding:'15px'}}><span style={{color: u.role==='student'?'#3b82f6':'#f59e0b'}}>{u.role.toUpperCase()}</span></td>
                            
                            {/* 👇 NEW DATA CELL */}
                            <td style={{padding:'15px'}}>
                                {u.role === 'sponsor' ? (
                                    <div>
                                        <div style={{fontWeight:'bold', color: 'white'}}>🏢 {u.companyName || 'No Name'}</div>
                                        <div style={{fontSize:'0.75rem', color:'#fca5a5'}}>GST: {u.gstNumber || 'Pending'}</div>
                                        {u.linkedinLink && <a href={u.linkedinLink} target="_blank" rel="noreferrer" style={{color:'#38bdf8', fontSize:'0.75rem'}}>View LinkedIn 🔗</a>}
                                    </div>
                                ) : (
                                    <span style={{color:'#64748b'}}>-</span>
                                )}
                            </td>

                            <td style={{padding:'15px'}}>{u.verificationDoc ? <a href={u.verificationDoc} target="_blank" style={{color:'#38bdf8'}}>View ID</a> : "No Doc"}</td>
                            <td style={{padding:'15px', display:'flex', gap:'10px'}}>
                                {!u.isVerified && <button onClick={()=>handleAction(`https://campus-sponser-api.onrender.com/api/users/${u._id}/approve`, 'put', "Verified!")} style={actionBtn('#16a34a')}>APPROVE</button>}
                                <button onClick={()=>handleAction(`https://campus-sponser-api.onrender.com/api/users/${u._id}`, 'delete', "Deleted")} style={actionBtn('#ef4444')}>🗑️</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
};

// HELPER COMPONENTS
const chartCard = { background: '#1e293b', padding: '20px', borderRadius: '15px', flex: '1 1 300px' };
const Tab = ({active, onClick, label, color}) => (<button onClick={onClick} style={{padding:'10px 15px', borderRadius:'8px', background: active ? `${color}20` : '#1e293b', border: active ? `2px solid ${color}` : 'none', color: active ? color : '#94a3b8', cursor:'pointer', fontWeight:'bold', marginRight: '10px'}}>{label}</button>);
const actionBtn = (bg) => ({ padding:'6px 12px', background:bg, color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold', fontSize:'0.7rem' });
const logoutBtn = { background:'#ef4444', color:'white', border:'none', padding:'8px 15px', borderRadius:'5px', cursor:'pointer', fontWeight:'bold' };

export default AdminDashboard;