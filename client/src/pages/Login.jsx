import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast'; // 👈 IMPORT TOAST

const Login = () => {
  const [view, setView] = useState('login'); // 'login', 'forgot', 'reset'
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });
  
  // 👇 State for Green Box
  const [developerOtp, setDeveloperOtp] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/login', formData);
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event("storage"));
      
      // 👇 ALERT REMOVED, TOAST ADDED
      toast.success("✅ Login Successful!");
      
      if (!res.data.isVerified) { navigate('/verify'); } 
      else { navigate('/'); }
      
    } catch (error) {
      // 👇 ERROR TOAST
      toast.error(error.response?.data?.message || "Invalid Credentials");
    } finally { setLoading(false); }
  };

  // 2. FORGOT PASSWORD (Instant OTP)
  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/forgot-password', { email: resetData.email });
      
      // 👇 Capture OTP immediately
      setDeveloperOtp(res.data.debugOtp);
      
      // 👇 Success Message
      toast.success("OTP Generated!");
      
      setView('reset'); 
    } catch (error) {
      toast.error(error.response?.data?.message || "User not found");
    } finally { setLoading(false); }
  };

  // 3. RESET PASSWORD
  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/api/users/reset-password', resetData);
      
      // 👇 ALERT REMOVED, TOAST ADDED
      toast.success("🎉 Password Changed! Please Login.");
      
      setView('login');
      setDeveloperOtp(null);
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'Poppins' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        {/* === VIEW 1: LOGIN === */}
        {view === 'login' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>👋 Welcome Back</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="password" placeholder="Password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
            <p style={{textAlign:'center', marginTop:'15px', fontSize:'0.9rem'}}><span onClick={() => setView('forgot')} style={{color:'#ef4444', cursor:'pointer', textDecoration:'underline'}}>Forgot Password?</span></p>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>New user? <Link to="/register" style={{ color: '#2563eb', fontWeight: 'bold' }}>Create Account</Link></div>
          </>
        )}

        {/* === VIEW 2: FORGOT (Enter Email) === */}
        {view === 'forgot' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#1e293b' }}>🔐 Reset Password</h2>
            <p style={{textAlign:'center', color:'#666', fontSize:'0.9rem', marginBottom:'20px'}}>Enter email to receive Developer Code</p>
            <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" placeholder="Enter your Email" value={resetData.email} onChange={e=>setResetData({...resetData, email:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                {loading ? 'Generating...' : 'Get Instant OTP'}
              </button>
            </form>
            <button onClick={() => setView('login')} style={{width:'100%', marginTop:'15px', background:'none', border:'none', color:'#64748b', cursor:'pointer'}}>Cancel</button>
          </>
        )}

        {/* === VIEW 3: RESET (Green Box OTP) === */}
        {view === 'reset' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#1e293b' }}>🔓 Enter OTP</h2>
            
            {/* 👇 GREEN BOX WITH OTP (As it is rakha hai) */}
            {developerOtp && (
                <div style={{background: '#dcfce7', border: '2px dashed #16a34a', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px', animation: 'fadeIn 0.5s'}}>
                    <span style={{color: '#166534', fontSize: '0.9rem', display: 'block', marginBottom: '5px'}}>Developer Code:</span>
                    <strong style={{color: '#16a34a', fontSize: '2rem', letterSpacing: '3px', fontFamily:'monospace'}}>{developerOtp}</strong>
                </div>
            )}

            <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Enter OTP" value={resetData.otp} onChange={e=>setResetData({...resetData, otp:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', letterSpacing:'2px', textAlign:'center', fontSize:'1.1rem' }} />
              <input type="password" placeholder="New Password" value={resetData.newPassword} onChange={e=>setResetData({...resetData, newPassword:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{loading ? 'Updating...' : 'Change Password'}</button>
            </form>
            <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }`}</style>
          </>
        )}

      </div>
    </div>
  );
};

export default Login;