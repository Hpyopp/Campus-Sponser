import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Agreement from './pages/Agreement';
import AdminDashboard from './pages/AdminDashboard';
import AdminRefunds from './pages/AdminRefunds';
import Verify from './pages/Verify';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// 👇 UPDATED USER SYNC (CRITICAL FIX)
const UserSync = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkStatus = async () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (!storedUser || !storedUser.token) return;

      try {
        const config = { headers: { Authorization: `Bearer ${storedUser.token}` } };
        const res = await axios.get('/api/users/me', config);
        const serverUser = res.data;

        // 👇 CHECK: Agar Status, Role, ya Doc Server par alag hai, toh sync karo
        if (
            serverUser.isVerified !== storedUser.isVerified || 
            serverUser.role !== storedUser.role ||
            serverUser.verificationDoc !== storedUser.verificationDoc // 👈 Ye Line Missing Thi
        ) {
            const updatedUser = { 
                ...storedUser, 
                isVerified: serverUser.isVerified, 
                role: serverUser.role,
                verificationDoc: serverUser.verificationDoc // Doc bhi update karo
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            window.dispatchEvent(new Event("storage"));
        }

      } catch (error) {
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      }
    };

    const interval = setInterval(checkStatus, 5000); // Har 5 sec check
    checkStatus(); // First load check

    return () => clearInterval(interval);
  }, [navigate, location]);

  return null;
};

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <UserSync />
        <Navbar />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

        <div style={{ flex: 1 }}> 
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
                <Route path="/profile" element={<Profile />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>

        <Footer />
        
      </div>
    </Router>
  );
}

export default App;