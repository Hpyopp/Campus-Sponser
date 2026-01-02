import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Agreement from './pages/Agreement';
import AdminDashboard from './pages/AdminDashboard';
import AdminRefunds from './pages/AdminRefunds';
import Verify from './pages/Verify';

// 👇 COMPONENT TO HANDLE BACKGROUND CHECKS
const UserSync = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      
      // Agar user login nahi hai, toh check mat karo
      if (!storedUser || !storedUser.token) return;

      try {
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        // Server se latest data mango
        const res = await axios.get('/api/users/me', config);
        const serverUser = res.data;

        // 👇 LOGIC: Agar Local aur Server ka status alag hai, toh update karo
        if (serverUser.isVerified !== storedUser.isVerified || serverUser.role !== storedUser.role) {
            
            // LocalStorage Update
            const updatedUser = { ...storedUser, isVerified: serverUser.isVerified, role: serverUser.role };
            localStorage.setItem('user', JSON.stringify(updatedUser));

            // Alert User
            if (serverUser.isVerified) {
                alert("🎉 Good News! Admin verified your account.");
            } else {
                alert("⚠️ Alert: Your verification was revoked by Admin.");
            }
            
            // Refresh UI
            window.location.reload(); 
        }

      } catch (error) {
        // Agar Token expire ho gaya (401), toh logout karo
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      }
    };

    // ⚡ Har 5 Second mein check karo (Polling)
    const interval = setInterval(checkStatus, 5000);
    
    // Page load hote hi ek baar turant check karo
    checkStatus();

    return () => clearInterval(interval);
  }, [navigate, location]);

  return null;
};

function App() {
  return (
    <Router>
      <UserSync /> {/* 👈 Ye line magic karegi */}
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create-event" element={<CreateEvent />} />
        <Route path="/event/:id" element={<EventDetails />} />
        <Route path="/agreement/:id" element={<Agreement />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/refunds" element={<AdminRefunds />} />
        <Route path="/verify" element={<Verify />} />
      </Routes>
    </Router>
  );
}

export default App;