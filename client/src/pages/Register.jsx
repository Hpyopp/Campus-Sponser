import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Register = () => {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('student');
  
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', companyName: '', collegeName: '' });
  const [otp, setOtp] = useState('');
  const [developerOtp, setDeveloperOtp] = useState(null); // Green Box Variable
  
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. REGISTER & GET OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    if(formData.phone.length < 10) return toast.error("Invalid Phone Number");
    
    setLoading(true);
    try {
      const res = await axios.post('/api/users', { ...formData, role });
      
      // 👇 YAHAN GALTI THI (Ab Fix Hai)
      setDeveloperOtp(res.data.otp); // Backend 'otp' bhej raha hai
      
      toast.success("OTP Sent! Check Green Box");
      setStep(2);
    } catch (error) {
      toast.error(error.response?.data?.message || "Error Occurred");
    } finally { setLoading(false); }
  };

  // 2. VERIFY OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/verify-otp', { email: formData.email, otp });
      
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event("storage"));
      
      toast.success("✅ Account Verified & Logged In!");
      
      if (res.data.role !== 'admin' && !res.data.verificationDoc) {
          navigate('/verify');
      } else {
          navigate('/');
      }
      
    } catch (error) {
      toast.error("Invalid OTP");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fafc', fontFamily: 'Poppins', padding:'20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#1e293b' }}>{step === 1 ? '🚀 Create Account' : '🔐 Verify OTP'}</h2>

        {step === 1 && (
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop:'20px' }}>
            
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom:'10px' }}>
              <button type="button" onClick={() => setRole('student')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: role === 'student' ? '2px solid #2563eb' : '1px solid #ccc', background: role === 'student' ? '#eff6ff' : 'white', fontWeight: 'bold', cursor: 'pointer', color:'#1e293b' }}>Student</button>
              <button type="button" onClick={() => setRole('sponsor')} style={{ flex: 1, padding: '10px', borderRadius: '8px', border: role === 'sponsor' ? '2px solid #2563eb' : '1px solid #ccc', background: role === 'sponsor' ? '#eff6ff' : 'white', fontWeight: 'bold', cursor: 'pointer', color:'#1e293b' }}>Sponsor</button>
            </div>

            <input type="text" placeholder="Full Name" value={formData.name} onChange={e=>setFormData({...formData, name:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="email" placeholder="Email Address" value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="number" placeholder="Mobile Number" value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input type="password" placeholder="Password" value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />

            {role === 'sponsor' ? (
                <input type="text" placeholder="Company Name" value={formData.companyName} onChange={e=>setFormData({...formData, companyName:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            ) : (
                <input type="text" placeholder="College Name" value={formData.collegeName} onChange={e=>setFormData({...formData, collegeName:e.target.value})} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            )}

            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{loading ? 'Processing...' : 'Get OTP'}</button>
            <div style={{ textAlign: 'center', marginTop: '10px' }}>Already have account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>Login</Link></div>
          </form>
        )}

        {step === 2 && (
          <div style={{marginTop:'20px'}}>
             {/* 👇 GREEN BOX DISPLAY */}
             {developerOtp && (
                <div style={{background: '#dcfce7', border: '2px dashed #16a34a', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px', animation: 'fadeIn 0.5s'}}>
                    <span style={{color: '#166534', fontSize: '0.9rem', display: 'block', marginBottom: '5px'}}>Developer Code:</span>
                    <strong style={{color: '#16a34a', fontSize: '2rem', letterSpacing: '3px', fontFamily:'monospace'}}>{developerOtp}</strong>
                </div>
            )}
            <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <input type="text" placeholder="Enter OTP" value={otp} onChange={e=>setOtp(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', letterSpacing:'5px', textAlign:'center', fontSize:'1.2rem' }} />
              <button type="submit" disabled={loading} style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>{loading ? 'Verifying...' : 'Verify & Login'}</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
export default Register;