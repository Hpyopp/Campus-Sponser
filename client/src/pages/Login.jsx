import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [serverOtp, setServerOtp] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    if(e) e.preventDefault();
    setLoading(true);
    setServerOtp(null);

    try {
      const res = await axios.post('/api/users/login', { email });
      setStep(2); // Direct change
      if (res.data.debugOtp) setServerOtp(res.data.debugOtp);
    } catch (err) {
      alert(err.response?.data?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

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
    const val = e.target.value.replace(/\s/g, ''); 
    if (!/^\d*$/.test(val)) return;
    setOtp(val);
    if (val.length === 6) verifyOtpRequest(val);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '40px', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', fontFamily: 'Poppins' }}>
      
      <h2 style={{color: '#1e293b', marginBottom: '20px'}}>
        🔐 {step === 1 ? 'Login' : 'Enter OTP'}
      </h2>
      
      {step === 1 ? (
        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{width:'100%', padding:'14px', borderRadius:'10px', border:'1px solid #cbd5e1'}} />
          <button type="submit" disabled={loading} style={{padding:'14px', background:'#2563eb', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'1rem', fontWeight:'bold'}}>
            {loading ? 'Wait...' : 'Get OTP ➡️'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', animation: 'fadeIn 0.5s' }}>
          
          {serverOtp && (
            <div style={{ background: '#ecfdf5', color: '#064e3b', padding: '15px', border: '2px dashed #10b981', borderRadius:'12px' }}>
              <p style={{margin:0, fontSize:'0.8rem', color:'#6b7280'}}>DEVELOPER CODE:</p>
              <h1 style={{ margin: '5px 0', fontSize: '2rem' }}>{serverOtp}</h1>
            </div>
          )}

          <p style={{color:'#64748b'}}>OTP sent to <b>{email}</b></p>
          <input type="text" placeholder="______" value={otp} onChange={handleOtpChange} maxLength="6" autoFocus style={{textAlign:'center', fontSize:'2rem', letterSpacing:'10px', padding:'10px', width:'100%', border:'2px solid #2563eb', borderRadius:'10px'}} />
          
          <button type="button" onClick={() => handleSendOTP(null)} style={{background:'#f1f5f9', border:'none', padding:'10px', cursor:'pointer', marginTop:'10px', borderRadius:'5px'}}>
            🔄 Resend OTP
          </button>
        </div>
      )}
      
      <p style={{ marginTop: '20px', fontSize:'0.9rem', color:'#64748b' }}>New here? <Link to="/register" style={{color:'#2563eb', fontWeight:'600'}}>Register</Link></p>
      <style>{`@keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }`}</style>
    </div>
  );
};
export default Login;