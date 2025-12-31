import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' // Default role
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ CORRECT ADDRESS: /api/users (Pehle /api/auth tha jo 404 de raha tha)
      const { data } = await axios.post('/api/users', formData);
      
      localStorage.setItem('user', JSON.stringify(data));
      alert("Registration Successful! Welcome to CampusSponsor 🚀");
      navigate('/');
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', borderRadius: '10px', background: 'white' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>📝 Register</h2>
      {error && <p style={{ color: 'red', textAlign: 'center', fontSize: '0.9rem' }}>{error}</p>}
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>Full Name</label>
          <input type="text" placeholder="Enter Name" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Email Address</label>
          <input type="email" placeholder="Enter Email" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password</label>
          <input type="password" placeholder="Create Password" style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>I am a:</label>
          <select style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '5px', border: '1px solid #ccc' }}
            value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
            <option value="student">Student</option>
            <option value="sponsor">Sponsor</option>
          </select>
        </div>

        <button type="submit" style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
          Register Now
        </button>
      </form>
    </div>
  );
};

export default Register;