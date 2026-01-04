import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Login = () => {
  const [view, setView] = useState('login'); 
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [resetData, setResetData] = useState({ email: '', otp: '', newPassword: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. LOGIN
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('https://campus-sponser-api.onrender.com/api/users/login', {
        email: formData.email.trim(), // Fix: Trim spaces
        password: formData.password
      });

      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event("storage"));
      toast.success("🚀 Welcome Back!");
      
      if (res.data.role === 'admin') { navigate('/admin'); } 
      else if (!res.data.isVerified) { navigate('/verify'); } 
      else { navigate('/'); }
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid Credentials");
    } finally { setLoading(false); }
  };

  // 2. FORGOT PASSWORD
  const handleForgot = async (e) => { 
      e.preventDefault(); 
      setLoading(true); 
      try { 
          await axios.post('https://campus-sponser-api.onrender.com/api/users/forgot-password', { 
            email: resetData.email.trim() // Fix: Trim spaces
          }); 
          toast.success("📧 OTP Sent! Check your Email."); 
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
          await axios.post('https://campus-sponser-api.onrender.com/api/users/reset-password', {
            email: resetData.email.trim(),
            otp: resetData.otp.trim(),
            newPassword: resetData.newPassword
          }); 
          toast.success("Password Changed! Login now."); 
          setView('login'); 
      } catch (error) { 
          toast.error(error.response?.data?.message || "Invalid or Expired OTP"); 
      } finally { setLoading(false); } 
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins', padding: '20px' }}>
      <div style={{ background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '90%', maxWidth: '400px' }}>
        
        {view === 'login' && (
          <>
            <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>👋 Welcome Back</h2>
            <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="email" placeholder="Email" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <input type="password" placeholder="Password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}>{loading ? 'Logging in...' : 'Login'}</button>
            </form>
            <p style={{textAlign:'center', marginTop:'15px', fontSize:'0.9rem'}}><span onClick={() => setView('forgot')} style={{color:'#ef4444', cursor:'pointer', textDecoration:'underline'}}>Forgot Password?</span></p>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>New user? <Link to="/register" style={{ color: '#2563eb', fontWeight: 'bold' }}>Create Account</Link></div>
          </>
        )}

        {view === 'forgot' && (
            <>
                <h2 style={{ textAlign: 'center', color: '#1e293b' }}>🔐 Reset Password</h2>
                <p style={{textAlign:'center', color:'#666', fontSize:'0.9rem', marginBottom:'20px'}}>Enter email to receive OTP</p>
                <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="email" placeholder="Enter your Email" value={resetData.email} onChange={e=>setResetData({...resetData, email:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <button type="submit" disabled={loading} style={{ padding: '12px', background: '#f59e0b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}>{loading ? 'Sending...' : 'Send OTP'}</button>
                </form>
                <button onClick={() => setView('login')} style={{width:'100%', marginTop:'15px', background:'none', border:'none', color:'#64748b', cursor:'pointer'}}>Cancel</button>
            </>
        )}

        {view === 'reset' && (
            <>
                <h2 style={{ textAlign: 'center', color: '#1e293b' }}>🔓 Enter OTP</h2>
                <p style={{textAlign:'center', fontSize:'0.9rem', color:'#64748b', marginBottom:'15px'}}>Check your email for code</p>
                <form onSubmit={handleReset} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" placeholder="Enter OTP" value={resetData.otp} onChange={e=>setResetData({...resetData, otp:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', letterSpacing:'2px', textAlign:'center', fontSize:'1.1rem' }} />
                    <input type="password" placeholder="New Password" value={resetData.newPassword} onChange={e=>setResetData({...resetData, newPassword:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
                    <button type="submit" disabled={loading} style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', opacity: loading ? 0.7 : 1 }}>{loading ? 'Updating...' : 'Change Password'}</button>
                </form>
            </>
        )}
      </div>
    </div>
  );
};
export default Login;