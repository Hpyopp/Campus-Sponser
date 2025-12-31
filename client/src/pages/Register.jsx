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
    
    // 🔒 1. Gmail Validation (Sirf @gmail.com chalega)
    if (!email.endsWith('@gmail.com')) {
      return alert("🚫 Invalid Email! Please use a valid Google account (@gmail.com)");
    }

    // 🔒 2. Phone Validation
    if(phone.length !== 10) {
      return alert("🚫 Invalid Phone! Please enter a 10-digit mobile number.");
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
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '10px', fontFamily: 'Poppins, sans-serif' }}>
      <h2 style={{color: '#1e293b'}}>📝 Register</h2>
      <p style={{color: '#64748b', fontSize: '0.9rem', marginBottom: '20px'}}>Use your official Gmail account.</p>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input type="text" name="name" placeholder="Full Name" value={name} onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
        
        {/* 👇 Input type email hai, par hum JS se strict check karenge */}
        <input type="email" name="email" placeholder="Email (@gmail.com only)" value={email} onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
        
        <input type="number" name="phone" placeholder="Mobile Number (10 digits)" value={phone} onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />

        <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
        
        <button type="submit" style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>Register Now</button>
      </form>
      <p style={{ marginTop: '15px', fontSize: '0.9rem' }}>Already have an account? <Link to="/login" style={{color: '#2563eb'}}>Login</Link></p>
    </div>
  );
};

export default Register;