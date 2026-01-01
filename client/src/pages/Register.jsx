import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  // --- STATES ---
  const [step, setStep] = useState(1); // 1 = Form, 2 = Green Box
  
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'student', 
    companyName: '', collegeName: '' 
  });
  const { name, email, password, phone, role, companyName, collegeName } = formData;

  const [serverOtp, setServerOtp] = useState(''); // Ye Green Box me dikhega
  const [userOtp, setUserOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  // STEP 1: FORM SUBMIT -> GREEN BOX DIKHAO
  const onRegisterSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    try {
      const res = await axios.post('/api/users', formData);
      
      // ✅ SUCCESS: OTP save karo aur Step 2 pe jao
      setServerOtp(res.data.debugOtp); 
      setStep(2); 

    } catch (error) { 
        alert(error.response?.data?.message || 'Registration Failed'); 
    } finally { 
        setLoading(false); 
    }
  };

  // STEP 2: VERIFY OTP -> LOGIN
  const onVerifySubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    const cleanOtp = userOtp.replace(/\s/g, ''); 

    try {
      const res = await axios.post('/api/users/verify-otp', { email, otp: cleanOtp });
      
      localStorage.setItem('user', JSON.stringify(res.data)); 
      alert('✅ Verified & Logged In! Welcome.');
      navigate('/'); 
    } catch (error) {
      alert(error.response?.data?.message || 'Invalid OTP');
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', fontFamily: 'Poppins' }}>
      
      {/* 👇 STEP 1: FORM */}
      {step === 1 && (
        <div style={{ padding: '30px', border: '1px solid #ddd', borderRadius: '15px' }}>
            <h2 style={{ textAlign: 'center', color: '#1e293b' }}>📝 Create Account</h2>
            <form onSubmit={onRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                    <label style={{cursor:'pointer', padding:'10px', borderRadius:'20px', background: role === 'student' ? '#2563eb' : '#f1f5f9', color: role === 'student' ? 'white' : 'black'}}><input type="radio" name="role" value="student" checked={role === 'student'} onChange={onChange} style={{display:'none'}} />🎓 Student</label>
                    <label style={{cursor:'pointer', padding:'10px', borderRadius:'20px', background: role === 'sponsor' ? '#2563eb' : '#f1f5f9', color: role === 'sponsor' ? 'white' : 'black'}}><input type="radio" name="role" value="sponsor" checked={role === 'sponsor'} onChange={onChange} style={{display:'none'}} />💼 Sponsor</label>
                </div>
                <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
                {role === 'student' && <input type="text" name="collegeName" value={collegeName} onChange={onChange} placeholder="College Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />}
                {role === 'sponsor' && <input type="text" name="companyName" value={companyName} onChange={onChange} placeholder="Company Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />}
                <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
                <input type="text" name="phone" value={phone} onChange={onChange} placeholder="Phone" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
                <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
                <button type="submit" disabled={loading} style={{padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>{loading ? 'Creating...' : 'Register ➡'}</button>
            </form>
            <p style={{textAlign:'center', marginTop:'10px'}}>Already have account? <Link to="/login">Login</Link></p>
        </div>
      )}

      {/* 👇 STEP 2: GREEN BOX (OTP POPUP) */}
      {step === 2 && (
        <div style={{
            background: '#dcfce7', border: '2px solid #22c55e', color: '#14532d',
            padding: '30px', borderRadius: '15px', boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
            textAlign: 'center', animation: 'fadeIn 0.5s ease-in'
        }}>
            <h2 style={{margin:'0 0 20px 0'}}>🔐 Verify OTP</h2>
            
            {/* OTP DISPLAY */}
            <div style={{background:'white', padding:'15px', borderRadius:'8px', marginBottom:'20px', border:'2px dashed #14532d'}}>
                <small style={{display:'block', marginBottom:'5px', color:'#15803d'}}>Use this Code (Email Backup):</small>
                <div style={{fontSize:'2rem', fontWeight:'bold', letterSpacing:'5px', color:'#14532d'}}>
                    {serverOtp}
                </div>
            </div>

            <form onSubmit={onVerifySubmit}>
                <input 
                    type="text" 
                    value={userOtp} 
                    onChange={(e) => setUserOtp(e.target.value.replace(/\s/g, ''))} 
                    placeholder="Enter Code Here" 
                    maxLength="6"
                    required 
                    style={{padding:'15px', fontSize:'1.5rem', textAlign:'center', letterSpacing:'5px', width:'80%', marginBottom:'20px', borderRadius:'8px', border:'2px solid #14532d', outline:'none'}} 
                />
                <button type="submit" disabled={loading} style={{width:'100%', padding:'15px', background:'#14532d', color:'white', border:'none', borderRadius:'8px', cursor:'pointer', fontSize:'1.1rem', fontWeight:'bold'}}>
                    {loading ? 'Verifying...' : 'Verify & Login ✅'}
                </button>
            </form>
            <button onClick={() => setStep(1)} style={{marginTop:'20px', background:'none', border:'none', textDecoration:'underline', cursor:'pointer', color:'#14532d'}}>Wrong Email? Go Back</button>
        </div>
      )}
      
      <style>{`@keyframes fadeIn { from {opacity: 0; transform: translateY(-20px);} to {opacity: 1; transform: translateY(0);} }`}</style>
    </div>
  );
};
export default Register;