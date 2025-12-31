import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email, 2 = OTP
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Step 1: Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/users/login', { email });
      setStep(2); // OTP screen dikhao
      alert(`OTP sent to ${email}`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Auto Verify Function
  const verifyOtpRequest = async (enteredOtp) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login/verify', { email, otp: enteredOtp });
      
      // Save User & Redirect
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
      
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
      setOtp(''); // Clear galat OTP
    } finally {
      setLoading(false);
    }
  };

  // 👇 AUTO VERIFY LOGIC
  const handleOtpChange = (e) => {
    const val = e.target.value;
    setOtp(val);

    // Agar 6 digits ho gaye, toh apne aap submit karo
    if (val.length === 6) {
      verifyOtpRequest(val);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      <h2 style={{color: '#1e293b'}}>🔐 {step === 1 ? 'Login' : 'Enter OTP'}</h2>
      
      {step === 1 ? (
        // EMAIL FORM
        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{color: '#64748b'}}>We will send a code to your email.</p>
          <input 
            type="email" 
            placeholder="Enter your registered email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc' }}
          />
          <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Sending OTP... ⏳' : 'Get OTP ➡️'}
          </button>
        </form>
      ) : (
        // OTP FORM
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{color: '#64748b'}}>Check your email for the code.</p>
          <input 
            type="text" 
            placeholder="Enter 6-digit OTP" 
            value={otp} 
            onChange={handleOtpChange} // Auto check yahan hai
            maxLength="6"
            style={{ padding: '15px', borderRadius: '8px', border: '2px solid #2563eb', textAlign: 'center', fontSize: '1.5rem', letterSpacing: '5px' }}
          />
          <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>
            Wrong Email? Go Back
          </button>
          
          {loading && <p>Verifying... 🔄</p>}
        </div>
      )}
      
      <p style={{ marginTop: '20px' }}>New here? <Link to="/register">Register</Link></p>
    </div>
  );
};

export default Login;