import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    role: 'student',
    companyName: '', // 👈 New Field
  });
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, phone, role, companyName } = formData;

  const onChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users', formData);
      alert(`Account Created! Your OTP is: ${res.data.debugOtp || 'Sent to Email'}`);
      navigate('/login');
    } catch (error) {
      alert(error.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b' }}>📝 Create Account</h2>
      <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>Join CampusSponsor today</p>

      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        {/* ROLE SELECTOR */}
        <div style={{display:'flex', gap:'10px', justifyContent:'center', marginBottom:'10px'}}>
            <label style={{cursor:'pointer', padding:'10px 20px', borderRadius:'20px', background: role === 'student' ? '#2563eb' : '#f1f5f9', color: role === 'student' ? 'white' : 'black', fontWeight:'bold'}}>
                <input type="radio" name="role" value="student" checked={role === 'student'} onChange={onChange} style={{display:'none'}} />
                🎓 Student
            </label>
            <label style={{cursor:'pointer', padding:'10px 20px', borderRadius:'20px', background: role === 'sponsor' ? '#2563eb' : '#f1f5f9', color: role === 'sponsor' ? 'white' : 'black', fontWeight:'bold'}}>
                <input type="radio" name="role" value="sponsor" checked={role === 'sponsor'} onChange={onChange} style={{display:'none'}} />
                💼 Sponsor
            </label>
        </div>

        <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
        
        {/* 👇 COMPANY NAME INPUT (Only for Sponsors) */}
        {role === 'sponsor' && (
            <input 
                type="text" 
                name="companyName" 
                value={companyName} 
                onChange={onChange} 
                placeholder="🏢 Company / Organization Name" 
                required 
                style={{ padding: '12px', borderRadius: '8px', border: '2px solid #2563eb', background: '#eff6ff' }} 
            />
        )}

        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email Address" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="text" name="phone" value={phone} onChange={onChange} placeholder="Phone Number" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }} />

        <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}>
          {loading ? 'Creating...' : 'Register 🚀'}
        </button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
      </p>
    </div>
  );
};

export default Register;