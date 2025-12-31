import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, phone } = formData;
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // STEP 1: Register & Catch OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@gmail.com')) return alert("Use @gmail.com only!");
    setLoading(true);
    try {
      const res = await axios.post('/api/users', formData);
      setStep(2);
      
      // 👇 BYPASS ALERT: Agar email fail hua, toh OTP yahan dikhega
      if (res.data.debugOtp) {
        alert(`⚠️ Email Server Busy!\n\nYOUR OTP IS: ${res.data.debugOtp}`);
      } else {
        alert(`OTP Sent to ${email}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify
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
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px' }}>
      <h2>📝 {step === 1 ? 'Register' : 'Verify Email'}</h2>
      {step === 1 ? (
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="text" name="name" placeholder="Full Name" value={name} onChange={handleChange} required style={inputStyle} />
          <input type="email" name="email" placeholder="Email" value={email} onChange={handleChange} required style={inputStyle} />
          <input type="number" name="phone" placeholder="Mobile" value={phone} onChange={handleChange} required style={inputStyle} />
          <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Wait...' : 'Next ➡️'}</button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p>Enter OTP for {email}</p>
          <input type="text" placeholder="______" value={otp} onChange={handleOtpChange} maxLength="6" autoFocus style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }} />
        </div>
      )}
      <p style={{ marginTop: '15px' }}>Existing user? <Link to="/login">Login</Link></p>
    </div>
  );
};
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc' };
const btnStyle = { padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
export default Register;