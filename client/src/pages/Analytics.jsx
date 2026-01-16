import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
    LineChart, Line, CartesianGrid, PieChart, Pie, Cell 
} from 'recharts';

const Analytics = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user'));
  const navigate = useNavigate();

  const ENDPOINT = window.location.hostname === 'localhost' 
    ? "http://127.0.0.1:5000" 
    : "https://campus-sponser-api.onrender.com";

  // Recharts console error fix
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      if (typeof args[0] === "string" && /defaultProps/.test(args[0])) return;
      originalError(...args);
    };
    return () => { console.error = originalError; }; 
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        if (!user) { navigate('/login'); return; }
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            // Hum User Profile API se hi data nikaal lenge calculation ke liye
            const { data: userData } = await axios.get(`${ENDPOINT}/api/users/u/${user._id}`, config);
            
            processData(userData.events);
        } catch (error) { console.error(error); }
        finally { setLoading(false); }
    };
    fetchData();
  }, [user]);

  const processData = (events) => {
      // 1. Total Raised
      const totalRaised = events.reduce((acc, curr) => acc + (curr.raisedAmount || 0), 0);
      
      // 2. Total Sponsors
      let sponsorCount = 0;
      events.forEach(e => sponsorCount += e.sponsors?.filter(s => s.status === 'verified').length || 0);

      // 3. Monthly Funding Data (For Line Chart)
      const monthlyData = [
          { name: 'Jan', amount: 0 }, { name: 'Feb', amount: 0 }, { name: 'Mar', amount: 0 },
          { name: 'Apr', amount: 0 }, { name: 'May', amount: 0 }, { name: 'Jun', amount: 0 },
          { name: 'Jul', amount: 0 }, { name: 'Aug', amount: 0 }, { name: 'Sep', amount: 0 },
          { name: 'Oct', amount: 0 }, { name: 'Nov', amount: 0 }, { name: 'Dec', amount: 0 }
      ];

      events.forEach(e => {
          e.sponsors?.forEach(s => {
              if (s.status === 'verified') {
                  const month = new Date(e.createdAt).getMonth(); // 0-11
                  monthlyData[month].amount += s.amount;
              }
          });
      });

      // 4. Category Data (For Pie Chart)
      const categoryMap = {};
      events.forEach(e => {
          categoryMap[e.category] = (categoryMap[e.category] || 0) + 1;
      });
      const pieData = Object.keys(categoryMap).map(key => ({ name: key, value: categoryMap[key] }));

      setData({
          totalRaised,
          totalEvents: events.length,
          sponsorCount,
          monthlyData,
          pieData
      });
  };

  if (loading) return <div style={{textAlign:'center', marginTop:'50px'}}>Analyzing Data... 📊</div>;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px', fontFamily: "'Poppins', sans-serif" }}>
      
      <h1 style={{ color: '#1e293b', marginBottom: '10px' }}>📊 Your Performance Analytics</h1>
      <p style={{ color: '#64748b', marginBottom: '40px' }}>Track your events, sponsorships, and growth.</p>

      {/* 🟢 TOP CARDS */}
      <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '40px' }}>
          <div style={cardStyle}>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Total Funds Raised</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#16a34a' }}>₹{data?.totalRaised}</div>
          </div>
          <div style={cardStyle}>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Events Organized</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2563eb' }}>{data?.totalEvents}</div>
          </div>
          <div style={cardStyle}>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>Verified Sponsors</div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>{data?.sponsorCount}</div>
          </div>
      </div>

      {/* 🟢 CHARTS SECTION */}
      <div style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
          
          {/* LEFT: Funding Growth (Line Chart) */}
          <div style={{ flex: 2, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px', color: '#334155' }}>💰 Funding Growth (Yearly)</h3>
              <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data?.monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} />
                          <YAxis axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                          <Line type="monotone" dataKey="amount" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} />
                      </LineChart>
                  </ResponsiveContainer>
              </div>
          </div>

          {/* RIGHT: Event Categories (Pie Chart) */}
          <div style={{ flex: 1, minWidth: '300px', background: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
              <h3 style={{ marginBottom: '20px', color: '#334155' }}>🎭 Event Categories</h3>
              <div style={{ height: '300px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                          <Pie
                              data={data?.pieData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              fill="#8884d8"
                              paddingAngle={5}
                              dataKey="value"
                          >
                              {data?.pieData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                          </Pie>
                          <Tooltip />
                      </PieChart>
                  </ResponsiveContainer>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center', marginTop: '20px' }}>
                  {data?.pieData.map((entry, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}>
                          <div style={{ width: '10px', height: '10px', backgroundColor: COLORS[index % COLORS.length], borderRadius: '50%' }}></div>
                          {entry.name}
                      </div>
                  ))}
              </div>
          </div>

      </div>

    </div>
  );
};

// CSS in JS helper
const cardStyle = {
    flex: 1,
    minWidth: '200px',
    background: 'white',
    padding: '25px',
    borderRadius: '15px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
    borderLeft: '5px solid #2563eb'
};

export default Analytics;