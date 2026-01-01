import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', phone: '', role: 'student', 
    companyName: '', collegeName: '' 
  });
  const [loading, setLoading] = useState(false);
  
  // Green Popup States
  const [showOtp, setShowOtp] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  const navigate = useNavigate();
  const { name, email, password, phone, role, companyName, collegeName } = formData;

  const onChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault(); 
    setLoading(true);
    
    try {
      const res = await axios.post('/api/users', formData);
      
      // ✅ STEP 1: OTP Save karo aur Popup dikhao
      setOtpValue(res.data.debugOtp);
      setShowOtp(true);

      // ✅ STEP 2: 5 Second baad Automatic Verify Page par bhejo (Login par nahi!)
      setTimeout(() => {
        navigate(`/verify-email`, { state: { email: email } });
      }, 5000); 

    } catch (error) { 
        alert(error.response?.data?.message || 'Error'); 
    } finally { 
        setLoading(false); 
    }
  };

  // 👇 Manual Navigation Function for Popup Button
  const goToVerify = () => {
    navigate(`/verify-email`, { state: { email: email } });
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins', position:'relative' }}>
      
      {/* 🟢 THE GREEN OTP BOX */}
      {showOtp && (
        <div style={{
            position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
            background: '#dcfce7', border: '2px solid #22c55e', color: '#14532d',
            padding: '20px 40px', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            textAlign: 'center', zIndex: 1000, animation: 'slideDown 0.5s ease-out'
        }}>
            <h3 style={{margin:'0 0 10px 0'}}>🔐 Verification Code</h3>
            <div style={{fontSize:'2rem', fontWeight:'bold', letterSpacing:'5px', background:'white', padding:'10px', borderRadius:'8px', border:'1px dashed #22c55e'}}>
                {otpValue}
            </div>
            <p style={{fontSize:'0.9rem', marginTop:'10px'}}>Redirecting to verify page...</p>
            
            {/* 👇 YE BUTTON BHI AB VERIFY PAGE PAR LE JAYEGA */}
            <button onClick={goToVerify} style={{marginTop:'10px', padding:'8px 20px', background:'#14532d', color:'white', border:'none', borderRadius:'5px', cursor:'pointer', fontWeight:'bold'}}>
                Enter Code ➡
            </button>
        </div>
      )}

      <style>{`@keyframes slideDown { from {top: -100px; opacity: 0;} to {top: 20px; opacity: 1;} }`}</style>

      <h2 style={{ textAlign: 'center', color: '#1e293b' }}>📝 Create Account</h2>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
            <label style={{cursor:'pointer', padding:'10px', borderRadius:'20px', background: role === 'student' ? '#2563eb' : '#f1f5f9', color: role === 'student' ? 'white' : 'black'}}><input type="radio" name="role" value="student" checked={role === 'student'} onChange={onChange} style={{display:'none'}} />🎓 Student</label>
            <label style={{cursor:'pointer', padding:'10px', borderRadius:'20px', background: role === 'sponsor' ? '#2563eb' : '#f1f5f9', color: role === 'sponsor' ? 'white' : 'black'}}><input type="radio" name="role" value="sponsor" checked={role === 'sponsor'} onChange={onChange} style={{display:'none'}} />💼 Sponsor</label>
        </div>
        <input type="text" name="name" value={name} onChange={onChange} placeholder="Full Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        {role === 'student' && <input type="text" name="collegeName" value={collegeName} onChange={onChange} placeholder="🎓 College Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />}
        {role === 'sponsor' && <input type="text" name="companyName" value={companyName} onChange={onChange} placeholder="🏢 Company Name" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />}
        <input type="email" name="email" value={email} onChange={onChange} placeholder="Email" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        <input type="text" name="phone" value={phone} onChange={onChange} placeholder="Phone" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        <input type="password" name="password" value={password} onChange={onChange} placeholder="Password" required style={{padding:'12px', border:'1px solid #ccc', borderRadius:'8px'}} />
        <button type="submit" disabled={loading} style={{padding:'12px', background:'#2563eb', color:'white', border:'none', borderRadius:'8px', cursor:'pointer'}}>{loading ? 'Processing...' : 'Register 🚀'}</button>
      </form>
      <p style={{textAlign:'center', marginTop:'10px'}}>Already have account? <Link to="/login">Login</Link></p>
    </div>
  );
};
export default Register;