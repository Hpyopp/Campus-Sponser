import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  const fetchNotifications = async () => {
      try {
          const config = { headers: { Authorization: `Bearer ${user.token}` } };
          const { data } = await axios.get(`${ENDPOINT}/api/notifications`, config);
          setNotifications(data);
          setLoading(false);
          
          // Page khulte hi "Read" mark kar do
          await axios.put(`${ENDPOINT}/api/notifications/read`, {}, config);
      } catch (error) {
          console.error("Error fetching notifications");
          setLoading(false);
      }
  };

  useEffect(() => {
      if(!user) navigate('/login');
      else fetchNotifications();
  }, []);

  // Icon Helper
  const getIcon = (type) => {
      switch(type) {
          case 'payment': return '💰';
          case 'approval': return '✅';
          case 'message': return '💬';
          default: return '📢';
      }
  };

  // Click Handler
  const handleClick = (n) => {
      if(n.type === 'payment' || n.type === 'approval') {
          navigate(`/events/${n.relatedId}`); // Event pe le jao
      } else if (n.type === 'message') {
          navigate('/chat');
      }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '40px auto', padding: '0 20px', fontFamily: "'Poppins', sans-serif" }}>
        <h2 style={{ color: '#1e293b', marginBottom: '20px', borderBottom:'2px solid #e2e8f0', paddingBottom:'10px' }}>
            🔔 Your Notifications
        </h2>

        {loading ? (
            <div style={{textAlign:'center', marginTop:'50px'}}>Loading updates... ⏳</div>
        ) : notifications.length === 0 ? (
            <div style={{textAlign:'center', padding:'50px', background:'#f8fafc', borderRadius:'15px', color:'#94a3b8'}}>
                <h3>No new notifications 💤</h3>
                <p>We'll notify you when something exciting happens!</p>
            </div>
        ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {notifications.map((n) => (
                    <div 
                        key={n._id} 
                        onClick={() => handleClick(n)}
                        style={{ 
                            background: n.isRead ? 'white' : '#eff6ff', 
                            padding: '20px', 
                            borderRadius: '15px', 
                            boxShadow: '0 4px 10px rgba(0,0,0,0.03)', 
                            borderLeft: `5px solid ${n.isRead ? '#cbd5e1' : '#2563eb'}`,
                            cursor: 'pointer',
                            transition: '0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '15px'
                        }}
                    >
                        <div style={{ fontSize: '1.5rem', background: '#f1f5f9', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {getIcon(n.type)}
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ margin: '0 0 5px 0', color: '#1e293b', fontWeight: n.isRead ? 'normal' : 'bold', fontSize: '1rem' }}>
                                {n.message}
                            </p>
                            <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                                {new Date(n.createdAt).toLocaleString()}
                            </span>
                        </div>
                        {!n.isRead && <div style={{width:'10px', height:'10px', background:'#2563eb', borderRadius:'50%'}}></div>}
                    </div>
                ))}
            </div>
        )}
    </div>
  );
};

export default Notifications;