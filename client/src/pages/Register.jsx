import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'student', 
    companyName: '', collegeName: '' 
  });
  const [serverOtp, setServerOtp] = useState(''); 
  const [userOtp, setUserOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, phone, role, companyName, collegeName } = formData;

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // 👇 STEP 1: REGISTER (NO ALERT)
  const onRegisterSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const res = await axios.post('/api/users', formData);
      setServerOtp(res.data.debugOtp); 
      setStep(2); // TURANT STEP CHANGE
    } catch (error) { 
        alert(error.response?.data?.message || 'Registration Failed'); 
    } finally { 
        setLoading(false); 
    }
  };

  // 👇 STEP 2: VERIFY (NO ALERT)
  const onVerifySubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const cleanOtp = userOtp.replace(/\s/g, '');
      const res = await axios.post('/api/users/verify-otp', { email, otp: cleanOtp });
      
      localStorage.setItem('user', JSON.stringify(res.data)); 
      navigate('/'); 
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', fontFamily: 'Poppins' }}>
      
      {step === 1 && (
        <div style={{ padding: '30px', border: '1px solid #e2e8f0', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom:'20px' }}>🚀 Create Account</h2>
            <form onSubmit={onRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                    <label style={{cursor:'pointer', padding:'8px 15px', borderRadius:'20px', background: role === 'student' ? '#2563eb' : '#f1f5f9', color: role === 'student' ? 'white' : 'black', fontSize:'0.9rem', fontWeight:'500'}}><input type="radio" name="role" value="student" checked={role === 'student'} onChange={onChange} style={{display:'none'}} />🎓 Student</label>
                    <label style={{cursor:'pointer', padding:'8px 15px', borderRadius:'20px', background: role === 'sponsor' ? '#2563eb' : '#f1f5f9', color: role === 'sponsor' ? 'white' : 'black', fontSize:'0.9rem', fontWeight:'500'}}><input type="radio" name="role" value="sponsor" checked={role === 'sponsor'} onChange={onChange} style={{display:'none'}} />💼 Sponsor</label>
                </div>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required style={{padding:'12px', border:'1px solid #cbd5e1', borderRadius:'8px'}} />
                {role === 'student' && <input type="text" name="collegeName" value={collegeName} onChange={onChange} placeholder="College Name" required style={{padding:'12px', border:'1px solid #cbd5e1', borderRadius:'8px'}} />}
                {role === 'sponsor' && <input type="text" name="companyName" value={companyName} onChange={onChange} placeholder="Company Name" required style={{padding:'12px', border:'1px solid #cbd5e1', borderRadius:'8px'}} />}
                <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required style={{padding:'12px', border:'1px solid #cbd5e1', borderRadius:'8px'}} />
                <input type="text" name="phone" value={phone} onChange={onChange} placeholder="Phone" required style={{padding:'12px', border:'1px solid #cbd5e1', borderRadius:'8px'}} />
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required style={{padding:'12px', border:'1px solid #cbd5e1', borderRadius:'8px'}} />
                
                <button type="submit" disabled={loading} style={{marginTop:'10px', padding:'14px', background:'#2563eb', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'1rem', fontWeight:'bold', transition:'0.3s'}}>
                    {loading ? 'Processing...' : 'Register & Verify ➡️'}
                </button>
            </form>
            <p style={{textAlign:'center', marginTop:'15px', color:'#64748b', fontSize:'0.9rem'}}>Already have an account? <Link to="/login" style={{color:'#2563eb', fontWeight:'600'}}>Login</Link></p>
        </div>
      )}

      {/* 👇 STYLE MATCHING "IMAGE 3" (CLEAN GREEN BOX) */}
      {step === 2 && (
        <div style={{
            background: '#ecfdf5', border: '2px solid #10b981', color: '#064e3b',
            padding: '40px 30px', borderRadius: '20px', textAlign: 'center', 
            boxShadow: '0 10px 30px rgba(16, 185, 129, 0.1)', animation: 'slideUp 0.4s ease-out'
        }}>
            <div style={{fontSize:'3rem', marginBottom:'10px'}}>🔐</div>
            <h2 style={{margin:'0 0 10px 0', fontSize:'1.8rem'}}>Verify Email</h2>
            <p style={{marginBottom:'20px', color:'#047857'}}>We sent a code to <strong>{email}</strong></p>
            
            <div style={{background:'white', padding:'15px', borderRadius:'12px', marginBottom:'25px', border:'1px dashed #10b981'}}>
                <small style={{display:'block', marginBottom:'5px', color:'#6b7280', fontSize:'0.8rem'}}>DEVELOPER MODE OTP:</small>
                <div style={{fontSize:'2.2rem', fontWeight:'800', letterSpacing:'4px', color:'#059669'}}>
                    {serverOtp}
                </div>
            </div>

            <form onSubmit={onVerifySubmit}>
                <input 
                    type="text" 
                    value={userOtp} 
                    onChange={(e) => setUserOtp(e.target.value.replace(/\s/g, ''))} 
                    placeholder="Enter Code" 
                    maxLength="6"
                    autoFocus
                    required 
                    style={{
                        padding:'15px', fontSize:'1.5rem', textAlign:'center', letterSpacing:'8px', 
                        width:'100%', marginBottom:'20px', borderRadius:'10px', 
                        border:'2px solid #10b981', outline:'none', background:'white', color:'#064e3b'
                    }} 
                />
                <button type="submit" disabled={loading} style={{width:'100%', padding:'15px', background:'#059669', color:'white', border:'none', borderRadius:'10px', cursor:'pointer', fontSize:'1.1rem', fontWeight:'bold', boxShadow:'0 4px 15px rgba(5, 150, 105, 0.3)'}}>
                    {loading ? 'Verifying...' : 'Verify & Login ✅'}
                </button>
            </form>
            <button onClick={() => setStep(1)} style={{marginTop:'20px', background:'none', border:'none', textDecoration:'underline', cursor:'pointer', color:'#059669', fontSize:'0.9rem'}}>Wrong Email? Go Back</button>
        </div>
      )}
      
      <style>{`@keyframes slideUp { from {opacity: 0; transform: translateY(20px);} to {opacity: 1; transform: translateY(0);} }`}</style>
    </div>
  );
};
export default Register;