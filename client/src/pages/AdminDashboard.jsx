import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'events'
  const navigate = useNavigate();

  // Load Data
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
      alert("Access Denied! Admins Only.");
      navigate('/');
      return;
    }
    fetchData(user.token);
  }, [navigate]);

  const fetchData = async (token) => {
    const config = { headers: { Authorization: `Bearer ${token}` } };
    try {
      // 1. Get Users
      const usersRes = await axios.get('/api/users', config);
      setUsers(usersRes.data);
      
      // 2. Get Events (Events public hote hain, but delete ke liye token chahiye)
      const eventsRes = await axios.get('/api/events');
      setEvents(eventsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const getToken = () => JSON.parse(localStorage.getItem('user')).token;

  // --- ACTIONS ---

  // 1. Approve User
  const approveUser = async (id) => {
    try {
      await axios.put(`/api/users/approve/${id}`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
      alert("User Approved ✅");
      fetchData(getToken()); // Refresh list
    } catch (err) { alert("Failed to approve"); }
  };

  // 2. Unapprove User
  const unapproveUser = async (id) => {
    if(!window.confirm("Are you sure you want to un-verify this user?")) return;
    try {
      await axios.put(`/api/users/unapprove/${id}`, {}, { headers: { Authorization: `Bearer ${getToken()}` } });
      alert("User Un-Verified ❌");
      fetchData(getToken());
    } catch (err) { alert("Failed to unverify"); }
  };

  // 3. Delete User
  const deleteUser = async (id) => {
    if(!window.confirm("WARNING: This will delete the user permanently!")) return;
    try {
      await axios.delete(`/api/users/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      alert("User Deleted 🗑️");
      fetchData(getToken());
    } catch (err) { alert("Failed to delete user"); }
  };

  // 4. Delete Event
  const deleteEvent = async (id) => {
    if(!window.confirm("Delete this event?")) return;
    try {
      await axios.delete(`/api/events/${id}`, { headers: { Authorization: `Bearer ${getToken()}` } });
      alert("Event Deleted 🗑️");
      fetchData(getToken());
    } catch (err) { alert("Failed to delete event"); }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto', fontFamily: 'Poppins' }}>
      <h1 style={{ textAlign: 'center', color: '#1e293b' }}>🛡️ Admin Dashboard</h1>
      
      {/* TABS */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', margin: '20px 0' }}>
        <button onClick={() => setActiveTab('users')} style={activeTab === 'users' ? activeBtn : inactiveBtn}>Manage Users</button>
        <button onClick={() => setActiveTab('events')} style={activeTab === 'events' ? activeBtn : inactiveBtn}>Manage Events</button>
      </div>

      {/* --- USERS SECTION --- */}
      {activeTab === 'users' && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
            <thead>
              <tr style={{ background: '#f1f5f9', textAlign: 'left' }}>
                <th style={th}>Name</th>
                <th style={th}>Email</th>
                <th style={th}>Role</th>
                <th style={th}>Status</th>
                <th style={th}>Doc</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={td}>{user.name}</td>
                  <td style={td}>{user.email}</td>
                  <td style={td}>{user.role}</td>
                  <td style={td}>
                    {user.isVerified ? <span style={{color:'green', fontWeight:'bold'}}>Verified</span> : <span style={{color:'red'}}>Pending</span>}
                  </td>
                  <td style={td}>
                    {user.verificationDoc ? <a href={user.verificationDoc} target="_blank" rel="noreferrer">View Doc</a> : 'No Doc'}
                  </td>
                  <td style={td}>
                    {/* APPROVE / UNAPPROVE */}
                    {user.role !== 'admin' && (
                      <>
                        {user.isVerified ? (
                          <button onClick={() => unapproveUser(user._id)} style={{...btn, background: '#f59e0b', marginRight: '5px'}}>Unverify</button>
                        ) : (
                          <button onClick={() => approveUser(user._id)} style={{...btn, background: '#10b981', marginRight: '5px'}}>Approve</button>
                        )}
                        
                        {/* DELETE */}
                        <button onClick={() => deleteUser(user._id)} style={{...btn, background: '#ef4444'}}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* --- EVENTS SECTION --- */}
      {activeTab === 'events' && (
        <div>
          {events.length === 0 ? <p style={{textAlign:'center'}}>No events found.</p> : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {events.map(event => (
                <div key={event._id} style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '10px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                  <h3>{event.title}</h3>
                  <p><strong>Date:</strong> {new Date(event.date).toDateString()}</p>
                  <p><strong>Location:</strong> {event.location}</p>
                  <p style={{color: '#64748b'}}>{event.description.substring(0, 100)}...</p>
                  <button onClick={() => deleteEvent(event._id)} style={{...btn, background: '#ef4444', width: '100%', marginTop: '10px'}}>Delete Event 🗑️</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Styles
const th = { padding: '12px', borderBottom: '2px solid #ddd' };
const td = { padding: '12px' };
const btn = { padding: '8px 12px', border: 'none', borderRadius: '5px', color: 'white', cursor: 'pointer', fontSize: '0.8rem' };
const activeBtn = { padding: '10px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' };
const inactiveBtn = { padding: '10px 20px', background: '#e2e8f0', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' };

export default AdminDashboard;