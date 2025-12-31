import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // STEP 1: Login & Catch OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login', { email });
      setStep(2);

      // 👇 BYPASS ALERT
      if (res.data.debugOtp) {
        alert(`⚠️ Email Server Busy!\n\nYOUR LOGIN OTP IS: ${res.data.debugOtp}`);
      } else {
        alert(`OTP sent to ${email}`);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: Verify
  const verifyOtpRequest = async (enteredOtp) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login/verify', { email, otp: enteredOtp });
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Wrong OTP');
      setOtp('');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    setOtp(val);
    if (val.length === 6) verifyOtpRequest(val);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px' }}>
      <h2>🔐 {step === 1 ? 'Login' : 'Enter OTP'}</h2>
      {step === 1 ? (
        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
          <button type="submit" disabled={loading} style={btnStyle}>{loading ? 'Wait...' : 'Get OTP ➡️'}</button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p>OTP sent to {email}</p>
          <input type="text" placeholder="______" value={otp} onChange={handleOtpChange} maxLength="6" autoFocus style={{ ...inputStyle, textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }} />
        </div>
      )}
      <p style={{ marginTop: '15px' }}>New here? <Link to="/register">Register</Link></p>
    </div>
  );
};
const inputStyle = { padding: '12px', borderRadius: '8px', border: '1px solid #ccc' };
const btnStyle = { padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' };
export default Login;