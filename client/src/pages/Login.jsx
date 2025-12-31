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
      setStep(2);

      if (res.data.debugOtp) {
        setServerOtp(res.data.debugOtp);
        // 👇 BACKUP ALERT (Agar Green Box na dikhe)
        alert(`Login OTP is: ${res.data.debugOtp}`);
      } else {
        alert("OTP sent via Email");
      }
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
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;
    setOtp(val);
    if (val.length === 6) verifyOtpRequest(val);
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins' }}>
      
      <h2 style={{color: '#1e293b', marginBottom: '20px'}}>
        🔐 {step === 1 ? 'Login' : 'Enter OTP'}
      </h2>
      
      {step === 1 ? (
        <form onSubmit={handleSendOTP} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{width:'100%', padding:'12px'}} />
          <button type="submit" disabled={loading} style={{padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>
            {loading ? 'Wait...' : 'Get OTP ➡️'}
          </button>
        </form>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* GREEN BOX */}
          {serverOtp && (
            <div style={{ background: '#dcfce7', color: '#166534', padding: '15px', border: '2px dashed #22c55e', borderRadius:'8px' }}>
              <p style={{margin:0, fontSize:'0.8rem'}}>Developer Code:</p>
              <h1 style={{ margin: '5px 0', fontSize: '2rem' }}>{serverOtp}</h1>
            </div>
          )}

          <p>OTP sent to <b>{email}</b></p>
          <input type="text" placeholder="______" value={otp} onChange={handleOtpChange} maxLength="6" autoFocus style={{textAlign:'center', fontSize:'1.5rem', letterSpacing:'5px', padding:'10px'}} />
          
          <button type="button" onClick={() => handleSendOTP(null)} style={{background:'#f1f5f9', border:'none', padding:'10px', cursor:'pointer'}}>
            🔄 Resend OTP
          </button>
        </div>
      )}
      
      <p style={{ marginTop: '15px' }}>New here? <Link to="/register">Register</Link></p>
    </div>
  );
};
export default Login;