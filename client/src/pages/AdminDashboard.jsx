import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const adminUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!adminUser || adminUser.role !== 'admin') { navigate('/login'); return; }
    fetchData();
  }, []);

  const fetchData = async () => {
    const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
    try {
      const uRes = await axios.get('/api/users/all', config);
      const eRes = await axios.get('/api/events', config);
      setUsers(uRes.data);
      setEvents(eRes.data);
    } catch (err) { console.error(err); }
  };

  const handleUserVerify = async (id, action) => {
    const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
    const url = action === 'approve' ? `/api/users/approve/${id}` : `/api/users/unverify/${id}`;
    await axios.put(url, {}, config);
    fetchData();
  };

  const handleEventApprove = async (id) => {
    const config = { headers: { Authorization: `Bearer ${adminUser.token}` } };
    await axios.put(`/api/events/admin/approve/${id}`, {}, config);
    fetchData();
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Poppins', background: '#f4f7f6', minHeight: '100vh' }}>
      <h2 style={{ color: '#b91c1c', borderBottom: '2px solid #b91c1c', paddingBottom: '10px' }}>🛡️ Super Admin Panel</h2>
      
      {/* USER MANAGEMENT */}
      <h3 style={{ marginTop: '30px' }}>👤 User Verification</h3>
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>User Details</th>
              <th style={{ padding: '15px' }}>Role</th>
              <th style={{ padding: '15px' }}>Document</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}><strong>{u.name}</strong><br/><small>{u.email}</small></td>
                <td style={{ padding: '15px', textAlign: 'center' }}>{u.role}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {u.verificationDoc ? <a href={u.verificationDoc} target="_blank">📄 View ID</a> : 'No Doc'}
                </td>
                <td style={{ padding: '15px', textAlign: 'center', color: u.isVerified ? 'green' : 'red' }}>
                  {u.isVerified ? 'Verified' : 'Pending'}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {!u.isVerified ? 
                    <button onClick={() => handleUserVerify(u._id, 'approve')} style={{ background: '#16a34a', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Approve</button> :
                    <button onClick={() => handleUserVerify(u._id, 'unverify')} style={{ background: '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Revoke</button>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* EVENT MANAGEMENT */}
      <h3 style={{ marginTop: '40px' }}>🎉 Event Approvals</h3>
      <div style={{ background: 'white', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f8fafc' }}>
            <tr>
              <th style={{ padding: '15px', textAlign: 'left' }}>Event Title</th>
              <th style={{ padding: '15px' }}>Budget</th>
              <th style={{ padding: '15px' }}>College Notice</th>
              <th style={{ padding: '15px' }}>Status</th>
              <th style={{ padding: '15px' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {events.map(e => (
              <tr key={e._id} style={{ borderTop: '1px solid #eee' }}>
                <td style={{ padding: '15px' }}>{e.title}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>₹{e.budget}</td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  <a href={e.permissionLetter} target="_blank">📄 View Notice</a>
                </td>
                <td style={{ padding: '15px', textAlign: 'center', color: e.isApproved ? 'green' : 'orange' }}>
                  {e.isApproved ? 'LIVE' : 'Pending'}
                </td>
                <td style={{ padding: '15px', textAlign: 'center' }}>
                  {!e.isApproved && <button onClick={() => handleEventApprove(e._id)} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Make Live</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default AdminDashboard;