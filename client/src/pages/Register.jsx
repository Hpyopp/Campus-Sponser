import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, phone } = formData;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // STEP 1: Submit Details & Get OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@gmail.com')) return alert("Use @gmail.com only!");
    if (phone.length !== 10) return alert("Phone must be 10 digits!");

    setLoading(true);
    try {
      await axios.post('/api/users', formData);
      setStep(2); // OTP Screen
      alert(`OTP Sent to ${email} 📩`);
    } catch (err) {
      alert(err.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify OTP
  const handleVerifyOtp = async (enteredOtp) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/users/register/verify', { email, otp: enteredOtp });
      
      localStorage.setItem('user', JSON.stringify(res.data));
      alert("Registration Successful! 🎉");
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
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      <h2 style={{color: '#1e293b'}}>📝 {step === 1 ? 'Register' : 'Verify Email'}</h2>
      
      {step === 1 ? (
        // FORM SCREEN
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="name" placeholder="Full Name" value={name} onChange={handleChange} required style={inputStyle} />
          <input type="email" name="email" placeholder="Email (@gmail.com)" value={email} onChange={handleChange} required style={inputStyle} />
          <input type="number" name="phone" placeholder="Mobile (10 digits)" value={phone} onChange={handleChange} required style={inputStyle} />
          <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} required style={inputStyle} />
          
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Sending OTP... ⏳' : 'Next ➡️'}
          </button>
        </form>
      ) : (
        // OTP SCREEN
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p>Enter code sent to <b>{email}</b></p>
          <input 
            type="text" 
            placeholder="______" 
            value={otp} 
            onChange={handleOtpChange} 
            maxLength="6"
            autoFocus
            style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }} 
          />
          {loading && <p>Verifying... 🔄</p>}
        </div>
      )}
      
      <p style={{ marginTop: '15px' }}>Already have an account? <Link to="/login">Login</Link></p>
    </div>
  );
};

const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc' };
const btnStyle = { padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' };

export default Register;