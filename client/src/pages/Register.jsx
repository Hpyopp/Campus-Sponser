import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'student', 
    companyName: '', collegeName: '' // 👈 New Fields
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { name, email, password, phone, role, companyName, collegeName } = formData;

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const res = await axios.post('/api/users', formData);
      alert(`Account Created! OTP: ${res.data.debugOtp}`);
      navigate('/login');
    } catch (error) { alert(error.response?.data?.message || 'Error'); } 
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      <h2 style={{ textAlign: 'center', color: '#1e293b' }}>📝 Create Account</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
            <label style={{cursor:'pointer', padding:'10px', borderRadius:'20px', background: role === 'student' ? '#2563eb' : '#f1f5f9', color: role === 'student' ? 'white' : 'black'}}><input type="radio" name="role" value="student" checked={role === 'student'} onChange={onChange} style={{display:'none'}} />🎓 Student</label>
            <label style={{cursor:'pointer', padding:'10px', borderRadius:'20px', background: role === 'sponsor' ? '#2563eb' : '#f1f5f9', color: role === 'sponsor' ? 'white' : 'black'}}><input type="radio" name="role" value="sponsor" checked={role === 'sponsor'} onChange={onChange} style={{display:'none'}} />💼 Sponsor</label>
        </div>
        <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        
        {/* 👇 NEW CONDITIONAL INPUTS */}
        {role === 'student' && <input type="text" name="collegeName" value={collegeName} onChange={onChange} placeholder="🎓 College / University Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />}
        {role === 'sponsor' && <input type="text" name="companyName" value={companyName} onChange={onChange} placeholder="🏢 Company Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />}

        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        <input type="text" name="phone" value={phone} onChange={onChange} placeholder="Phone" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        <button type="submit" disabled={loading} style={{padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>{loading ? 'Creating...' : 'Register 🚀'}</button>
      </form>
      <p style={{textAlign:'center', marginTop:'10px'}}>Already have account? <Link to="/login">Login</Link></p>
    </div>
  );
};
export default Register;