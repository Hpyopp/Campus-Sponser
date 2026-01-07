import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

const Analytics = () => {
  const [stats, setStats] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${ENDPOINT}/api/analytics/dashboard`, config);
        setStats(data);
      } catch (error) { console.error("Error fetching stats"); }
    };
    fetchStats();
  }, [user]);

  if (!stats) return <div style={{textAlign:'center', padding:'50px'}}>Loading Analytics... 📊</div>;

  const cardStyle = {
      background: 'white', borderRadius: '15px', padding: '25px', flex: 1,
      boxShadow: '0 4px 20px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center'
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '20px', fontFamily: 'Poppins' }}>
      
      <h1 style={{ fontSize: '2rem', color: '#1e293b', marginBottom: '10px' }}>
        {user.role === 'sponsor' ? 'Sponsor ROI Dashboard 📈' : 'Event Insights 📊'}
      </h1>
      <p style={{ color: '#64748b', marginBottom: '40px' }}>Track your performance and impact.</p>

      {/* TOP CARDS */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
        <div style={cardStyle}>
            <span style={{ fontSize: '3rem' }}>💰</span>
            <h3 style={{ margin: '10px 0', color: '#64748b', fontSize: '1rem' }}>
                {user.role === 'sponsor' ? 'Total Investment' : 'Total Raised'}
            </h3>
            <h2 style={{ margin: 0, fontSize: '2rem', color: '#16a34a' }}>
                ₹{user.role === 'sponsor' ? stats.totalSpent : stats.totalRaised}
            </h2>
        </div>
        <div style={cardStyle}>
            <span style={{ fontSize: '3rem' }}>👁️</span>
            <h3 style={{ margin: '10px 0', color: '#64748b', fontSize: '1rem' }}>
                {user.role === 'sponsor' ? 'Total Brand Reach (Views)' : 'Event Page Views'}
            </h3>
            <h2 style={{ margin: 0, fontSize: '2rem', color: '#2563eb' }}>
                {user.role === 'sponsor' ? stats.totalReach : stats.totalViews}
            </h2>
        </div>
        <div style={cardStyle}>
            <span style={{ fontSize: '3rem' }}>🚀</span>
            <h3 style={{ margin: '10px 0', color: '#64748b', fontSize: '1rem' }}>
                Events {user.role === 'sponsor' ? 'Sponsored' : 'Created'}
            </h3>
            <h2 style={{ margin: 0, fontSize: '2rem', color: '#f59e0b' }}>
                {stats.totalEvents}
            </h2>
        </div>
      </div>

      {/* CHARTS */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '30px' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px', color: '#334155' }}>
                {user.role === 'sponsor' ? 'Investment Distribution' : 'Fundraising Performance'}
            </h3>
            <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.graphData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey={user.role === 'sponsor' ? "amount" : "raised"} fill="#3b82f6" name="Amount (₹)" radius={[5, 5, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
        <div style={{ background: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h3 style={{ marginBottom: '20px', color: '#334155' }}>Engagement & Reach</h3>
            <div style={{ height: '300px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={stats.graphData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip />
                        <Area type="monotone" dataKey="views" stroke="#16a34a" fill="#dcfce7" name="Page Views" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;