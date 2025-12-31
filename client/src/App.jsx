import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyKYC from './pages/VerifyKYC';
import AdminDashboard from './pages/AdminDashboard';
import CreateEvent from './pages/CreateEvent';
import Agreement from './pages/Agreement'; // 👈 IMPORT KIYA

function App() {
  return (
    <Router>
      <div className="container">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify" element={<VerifyKYC />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/admin" element={<AdminDashboard />} />
          
          {/* 👇 NEW ROUTE */}
          <Route path="/agreement/:id" element={<Agreement />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;