import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyKYC from './pages/VerifyKYC'; // 👈 Ye Import Sahi Hona Chahiye
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';

function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <Routes>
          {/* ✅ PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* ✅ PROTECTED ROUTES */}
          {/* Ye check kar: /verify route par VerifyKYC component hi load hona chahiye */}
          <Route path="/verify" element={<VerifyKYC />} />
          
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;