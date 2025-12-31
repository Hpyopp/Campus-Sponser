import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ 
    name: '', email: '', password: '', phone: '', role: 'student' 
  });
  
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(null); // 👈 New: Screen par OTP dikhane ke liye
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, phone, role } = formData;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 1. REGISTER & SHOW OTP ON SCREEN
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@gmail.com')) return alert("Use @gmail.com only!");
    if (phone.length !== 10) return alert("Phone must be 10 digits!");

    setLoading(true);
    setServerOtp(null); // Clear old OTP

    try {
      const res = await axios.post('/api/users', formData);
      setStep(2); 

      // 👇 OTP KO SCREEN PAR DIKHAO (Alert nahi)
      if (res.data.debugOtp) {
        setServerOtp(res.data.debugOtp);
      } else {
        alert(`OTP Sent to ${email}`);
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Registration Failed');
      setStep(1); // Error aaye toh wapas form par bhejo
    } finally {
      setLoading(false);
    }
  };

  // 2. VERIFY OTP
  const handleVerifyOtp = async (enteredOtp) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/users/register/verify', { email, otp: enteredOtp });
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    setOtp(val);
    if (val.length === 6) handleVerifyOtp(val);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins, sans-serif' }}>
      
      {/* 👇 OTP DISPLAY BOX (Ye hamesha dikhega agar OTP aaya hai) */}
      {serverOtp && (
        <div style={{ background: '#dcfce7', color: '#166534', padding: '10px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #22c55e' }}>
          <strong>🚀 YOUR OTP IS:</strong>
          <h1 style={{ margin: '5px 0', fontSize: '2rem', letterSpacing: '5px' }}>{serverOtp}</h1>
          <small>Do not share this code.</small>
        </div>
      )}

      <h2 style={{color: '#1e293b', marginBottom: '20px'}}>
        📝 {step === 1 ? 'Join CampusSponsor' : 'Verify Email'}
      </h2>
      
      {step === 1 ? (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="name" placeholder="Full Name" value={name} onChange={handleChange} required style={inputStyle} />
          <input type="email" name="email" placeholder="Email (@gmail.com)" value={email} onChange={handleChange} required style={inputStyle} />
          <input type="number" name="phone" placeholder="Mobile Number" value={phone} onChange={handleChange} required style={inputStyle} />

          <div style={{ textAlign: 'left' }}>
            <label style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold', marginLeft: '5px' }}>I am a:</label>
            <select name="role" value={role} onChange={handleChange} style={{...inputStyle, marginTop: '5px', background: 'white'}}>
              <option value="student">🎓 Student</option>
              <option value="sponsor">💰 Sponsor</option>
            </select>
          </div>

          <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} required style={inputStyle} />
          
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Processing... ⏳' : 'Get OTP ➡️'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{color: '#64748b'}}>Enter OTP sent to <b>{email}</b></p>
          <input type="text" placeholder="______" value={otp} onChange={handleOtpChange} maxLength="6" autoFocus style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px', fontWeight: 'bold', color: '#2563eb' }} />
          <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>Wrong Email? Go Back</button>
        </div>
      )}
      
      <p style={{ marginTop: '20px' }}>Already have an account? <Link to="/login" style={{color: '#2563eb', fontWeight: 'bold'}}>Login</Link></p>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' };
const btnStyle = { padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' };

export default Register;