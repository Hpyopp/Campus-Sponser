import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Email screen, 2 = OTP screen
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // STEP 1: OTP bhejo
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/users/login', { email });
      setStep(2); // Screen change karo
      alert(`OTP sent to ${email} 📧`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: OTP check karo
  const verifyOtpRequest = async (enteredOtp) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login/verify', { email, otp: enteredOtp });
      
      // Success! Token save karo aur home pe jao
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/');
      
    } catch (err) {
      alert(err.response?.data?.message || 'Wrong Code! Try again.');
      setOtp(''); // Clear galat code
    } finally {
      setLoading(false);
    }
  };

  // 👇 AUTO SUBMIT LOGIC
  const handleOtpChange = (e) => {
    const val = e.target.value;
    // Sirf numbers allowed
    if (!/^\d*$/.test(val)) return;
    
    setOtp(val);

    // Agar 6 digits pure ho gaye, toh submit karo
    if (val.length === 6) {
      verifyOtpRequest(val);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '80px auto', textAlign: 'center', padding: '40px', border: '1px solid #e2e8f0', borderRadius: '20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', fontFamily: 'Poppins, sans-serif' }}>
      
      <h2 style={{color: '#1e293b', marginBottom: '10px'}}>
        {step === 1 ? '🔐 Login' : 'Enter OTP'}
      </h2>
      
      {step === 1 ? (
        // --- SCREEN 1: EMAIL INPUT ---
        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{color: '#64748b'}}>Login securely without a password.</p>
          
          <input 
            type="email" 
            placeholder="Enter registered Gmail" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
          />
          
          <button type="submit" disabled={loading} style={{ padding: '15px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', transition: 'background 0.3s' }}>
            {loading ? 'Sending Code... ⏳' : 'Get OTP ➡️'}
          </button>
        </form>
      ) : (
        // --- SCREEN 2: OTP INPUT ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{color: '#64748b'}}>We sent a code to <strong>{email}</strong></p>
          
          <input 
            type="text" 
            placeholder="______" 
            value={otp} 
            onChange={handleOtpChange} 
            maxLength="6"
            autoFocus
            style={{ 
              padding: '15px', 
              borderRadius: '10px', 
              border: '2px solid #2563eb', 
              textAlign: 'center', 
              fontSize: '2rem', 
              letterSpacing: '10px',
              fontWeight: 'bold',
              color: '#1e293b'
            }}
          />
          
          {loading && <p style={{color: '#2563eb', fontWeight: 'bold'}}>Verifying... 🔄</p>}

          <button onClick={() => setStep(1)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline', fontSize: '0.9rem' }}>
            Wrong Email? Go Back
          </button>
        </div>
      )}
      
      <div style={{ marginTop: '30px', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
        <p style={{ fontSize: '0.9rem' }}>New to CampusSponsor? <Link to="/register" style={{color: '#2563eb', fontWeight: 'bold'}}>Register Here</Link></p>
      </div>
    </div>
  );
};

export default Login;