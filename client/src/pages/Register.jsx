import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  // States
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '', role: 'student', companyName: '', collegeName: '' });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  // Handle Input
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 1. SEND OTP (Register Request)
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Backend request to create temp user & send OTP
      const res = await axios.post('/api/users', formData);
      alert(`✅ OTP Sent to ${formData.email}! Check your inbox.`);
      setStep(2); // Show OTP Input
    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    } finally { setLoading(false); }
  };

  // 2. VERIFY OTP & AUTO LOGIN
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post('/api/users/verify-otp', { email: formData.email, otp });
      
      // 👇 CRITICAL FIX: Save User & Force Update Navbar
      localStorage.setItem('user', JSON.stringify(res.data));
      window.dispatchEvent(new Event("storage")); // Navbar ko jagao

      alert("🎉 Registration Successful! Please upload your ID proof.");
      
      // 👇 FIX: Seedha Upload page par bhejo
      navigate('/verify'); 

    } catch (error) {
      alert(error.response?.data?.message || "Invalid OTP");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#f8fafc', fontFamily: 'Poppins' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '20px' }}>
          {step === 1 ? '🚀 Create Account' : '🔐 Enter OTP'}
        </h2>

        {step === 1 ? (
          // --- STEP 1: FORM ---
          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input name="name" placeholder="Full Name" onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input name="email" type="email" placeholder="Email Address" onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            <input name="phone" placeholder="Phone Number" onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />
            
            <select name="role" onChange={handleChange} style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }}>
              <option value="student">Student</option>
              <option value="sponsor">Sponsor</option>
            </select>

            {/* Role Specific Fields */}
            {formData.role === 'student' && <input name="collegeName" placeholder="College Name" onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />}
            {formData.role === 'sponsor' && <input name="companyName" placeholder="Company Name" onChange={handleChange} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc' }} />}

            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Sending OTP...' : 'Next ➡️'}
            </button>
          </form>
        ) : (
          // --- STEP 2: OTP ---
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <p style={{textAlign:'center', fontSize:'0.9rem', color:'#666'}}>OTP sent to <strong>{formData.email}</strong></p>
            <input name="otp" placeholder="Enter 6-digit OTP" onChange={(e) => setOtp(e.target.value)} required style={{ padding: '12px', borderRadius: '5px', border: '1px solid #ccc', textAlign: 'center', letterSpacing: '5px', fontSize: '1.2rem' }} />
            
            <button type="submit" disabled={loading} style={{ padding: '12px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              {loading ? 'Verifying...' : 'Verify & Login ✅'}
            </button>
            <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}>Wrong Email?</button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          Already have an account? <Link to="/login" style={{ color: '#2563eb', fontWeight: 'bold' }}>Login</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;