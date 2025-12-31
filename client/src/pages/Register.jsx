import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const navigate = useNavigate();

  const { name, email, password, phone } = formData;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🔒 Simple Validation
    if(phone.length !== 10) {
      return alert("Please enter a valid 10-digit mobile number!");
    }

    try {
      const res = await axios.post('/api/users', formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/'); // Go to Home
    } catch (err) {
      alert(err.response?.data?.message || 'Registration Failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h2>📝 Register</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input type="text" name="name" placeholder="Full Name" value={name} onChange={handleChange} required style={{ padding: '10px' }} />
        
        <input type="email" name="email" placeholder="Email Address" value={email} onChange={handleChange} required style={{ padding: '10px' }} />
        
        {/* 👇 Phone Number Input */}
        <input type="number" name="phone" placeholder="Mobile Number (10 digits)" value={phone} onChange={handleChange} required style={{ padding: '10px' }} />

        <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} required style={{ padding: '10px' }} />
        
        <button type="submit" style={{ padding: '10px', background: '#2563eb', color: 'white', border: 'none', cursor: 'pointer' }}>Register</button>
      </form>
      <p style={{ marginTop: '10px' }}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

export default Register;