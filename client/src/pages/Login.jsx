import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: OTP
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [debugOtp, setDebugOtp] = useState(null); // 👈 Green Box ke liye variable
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // STEP 1: SEND OTP (Instant Green Box Logic)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setDebugOtp(null); // Purana OTP hatao

    try {
      // API call (Backend ab instant response dega)
      const res = await axios.post('/api/users/login', { email });
      
      setStep(2); // Next step pe jao
      
      // 👇 AGAR BACKEND SE DEBUG OTP AAYA TOH DIKHAO
      if (res.data.debugOtp) {
          setDebugOtp(res.data.debugOtp);
      }
      
    } catch (error) {
      alert(error.response?.data?.message || 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  // STEP 2: VERIFY OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post('/api/users/verify-login', { email, otp });
      
      // User data save karo
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // Role ke hisab se redirect
      if (res.data.role === 'admin') {
          navigate('/admin/refunds');
      } else {
          navigate('/');
      }
      window.location.reload(); 
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8fafc', fontFamily: 'Poppins' }}>
      
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '350px', textAlign: 'center' }}>
        
        <h2 style={{ marginBottom: '20px', color: '#1e293b' }}>🔐 Login</h2>

        {step === 1 ? (
            // --- EMAIL FORM ---
            <form onSubmit={handleSendOtp}>
                <input 
                    type="email" 
                    placeholder="Enter your email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
                />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? 'Processing...' : 'Send OTP ➡️'}
                </button>
            </form>
        ) : (
            // --- OTP FORM ---
            <form onSubmit={handleVerifyOtp}>
                
                {/* 🟩 INSTANT GREEN BOX (Developer Mode) */}
                {debugOtp && (
                    <div style={{ background: '#dcfce7', color: '#166534', padding: '15px', borderRadius: '8px', marginBottom: '15px', border: '2px solid #22c55e', fontSize: '1.2rem', fontWeight: 'bold', animation: 'fadeIn 0.5s' }}>
                         OTP: {debugOtp}
                    </div>
                )}

                <input 
                    type="text" 
                    placeholder="Enter OTP" 
                    value={otp} 
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={{ width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #cbd5e1', textAlign: 'center', fontSize: '1.1rem', letterSpacing: '2px' }}
                />
                <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    {loading ? 'Verifying...' : 'Login 🚀'}
                </button>
            </form>
        )}

        <div style={{ marginTop: '20px', fontSize: '0.9rem' }}>
            New here? <Link to="/register" style={{ color: '#2563eb', fontWeight: 'bold' }}>Register</Link>
        </div>

        {/* Animation Style */}
        <style>{`
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(-10px); }
                to { opacity: 1; transform: translateY(0); }
            }
        `}</style>

      </div>
    </div>
  );
};

export default Login;