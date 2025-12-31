import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import Verify from './pages/Verify';
import SponsorDashboard from './pages/SponsorDashboard';
import CreateEvent from './pages/CreateEvent'; // 👈 Sirf EK baar hona chahiye

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/verify" element={<Verify />} />
        <Route path="/sponsor" element={<SponsorDashboard />} />
        <Route path="/create-event" element={<CreateEvent />} />
      </Routes>
    </Router>
  );
}

export default App;