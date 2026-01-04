import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';
import Agreement from './pages/Agreement';     // 📄 PDF Agreement Page
import AdminDashboard from './pages/AdminDashboard'; // ⚡ God Mode Panel (Includes Refunds)
import Verify from './pages/Verify';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// 👇 USER SYNC COMPONENT (Status, Role, Doc Sync karega)
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

        // Check for updates
        if (
            serverUser.isVerified !== storedUser.isVerified || 
            serverUser.role !== storedUser.role ||
            serverUser.verificationDoc !== storedUser.verificationDoc
        ) {
            const updatedUser = { 
                ...storedUser, 
                isVerified: serverUser.isVerified, 
                role: serverUser.role,
                verificationDoc: serverUser.verificationDoc
            };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            // Trigger storage event to update other components if needed
            window.dispatchEvent(new Event("storage"));
            console.log("🔄 User Synced with Server");
        }

      } catch (error) {
        // Agar Token expire ho gaya ya user delete ho gaya
        if (error.response && error.response.status === 401) {
            localStorage.clear();
            navigate('/login');
        }
      }
    };

    const interval = setInterval(checkStatus, 5000); // Har 5 second check
    checkStatus(); // First load check

    return () => clearInterval(interval);
  }, [navigate, location]);

  return null;
};

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        
        {/* Background Sync */}
        <UserSync />
        
        <Navbar />
        <Toaster position="top-center" toastOptions={{ duration: 3000 }} />

        <div style={{ flex: 1 }}> 
            <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/create-event" element={<CreateEvent />} />
                <Route path="/event/:id" element={<EventDetails />} />
                <Route path="/agreement/:id" element={<Agreement />} /> {/* 📄 PDF Link */}
                <Route path="/profile" element={<Profile />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminDashboard />} /> 
                {/* Note: /admin/refunds hata diya kyunki wo Dashboard me hi hai */}

                {/* System Routes */}
                <Route path="/verify" element={<Verify />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>

        <Footer />
        
      </div>
    </Router>
  );
}

export default App;