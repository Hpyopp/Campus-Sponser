import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Form, 2 = OTP
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { name, email, password, phone } = formData;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  // 1. REGISTER & GET INSTANT OTP
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!email.endsWith('@gmail.com')) return alert("Use @gmail.com only!");
    if (phone.length !== 10) return alert("Phone must be 10 digits!");

    setLoading(true);
    try {
      const res = await axios.post('/api/users', formData);
      setStep(2); // OTP Screen par bhejo

      // 👇 YE HAI INSTANT OTP POP-UP LOGIC
      if (res.data.debugOtp) {
        // Agar Server ne OTP bheja hai response mein (Dev Mode)
        alert(`🚀 Developer Mode On!\n\nYOUR OTP IS: ${res.data.debugOtp}`);
      } else {
        // Agar kabhi future mein asli email chala gaya
        alert(`OTP Sent to ${email} 📩`);
      }

    } catch (err) {
      alert(err.response?.data?.message || 'Registration Failed');
    } finally {
      setLoading(false);
    }
  };

  // 2. VERIFY OTP & LOGIN AUTOMATICALLY
  const handleVerifyOtp = async (enteredOtp) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/users/register/verify', { email, otp: enteredOtp });
      
      // Token Save Karo
      localStorage.setItem('user', JSON.stringify(res.data));
      
      alert("Registration Successful! Welcome to CampusSponsor 🎉");
      
      // Seedha Home Page par bhejo
      navigate('/');
      
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid OTP');
      setOtp(''); // Galat OTP hata do
    } finally {
      setLoading(false);
    }
  };

  // Auto-Submit jab 6 digits pure ho jaye
  const handleOtpChange = (e) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return; // Sirf numbers allowed
    
    setOtp(val);
    
    if (val.length === 6) {
      handleVerifyOtp(val);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', textAlign: 'center', padding: '30px', border: '1px solid #ddd', borderRadius: '15px', fontFamily: 'Poppins, sans-serif' }}>
      <h2 style={{color: '#1e293b', marginBottom: '20px'}}>
        📝 {step === 1 ? 'Register' : 'Verify Email'}
      </h2>
      
      {step === 1 ? (
        // --- SCREEN 1: REGISTRATION FORM ---
        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="text" name="name" placeholder="Full Name" 
            value={name} onChange={handleChange} required 
            style={inputStyle} 
          />
          <input 
            type="email" name="email" placeholder="Email (@gmail.com)" 
            value={email} onChange={handleChange} required 
            style={inputStyle} 
          />
          <input 
            type="number" name="phone" placeholder="Mobile Number" 
            value={phone} onChange={handleChange} required 
            style={inputStyle} 
          />
          <input 
            type="password" name="password" placeholder="Password" 
            value={password} onChange={handleChange} required 
            style={inputStyle} 
          />
          
          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'Processing... ⏳' : 'Get OTP ➡️'}
          </button>
        </form>
      ) : (
        // --- SCREEN 2: OTP INPUT ---
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <p style={{color: '#64748b'}}>Enter the code shown in the alert.</p>
          
          <input 
            type="text" 
            placeholder="______" 
            value={otp} 
            onChange={handleOtpChange} 
            maxLength="6"
            autoFocus
            style={{ 
              ...inputStyle, 
              textAlign: 'center', 
              fontSize: '1.5rem', 
              letterSpacing: '5px',
              fontWeight: 'bold',
              color: '#2563eb'
            }} 
          />
          
          {loading && <p style={{fontWeight: 'bold'}}>Verifying... 🔄</p>}
          
          <button 
            onClick={() => setStep(1)} 
            style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Wrong Email? Go Back
          </button>
        </div>
      )}
      
      <p style={{ marginTop: '20px' }}>
        Already have an account? <Link to="/login" style={{color: '#2563eb', fontWeight: 'bold'}}>Login</Link>
      </p>
    </div>
  );
};

// Simple Styling
const inputStyle = { 
  padding: '12px', 
  borderRadius: '8px', 
  border: '1px solid #ccc',
  fontSize: '1rem'
};

const btnStyle = { 
  padding: '12px', 
  background: '#2563eb', 
  color: 'white', 
  border: 'none', 
  borderRadius: '8px', 
  cursor: 'pointer', 
  fontWeight: 'bold',
  fontSize: '1rem' 
};

export default Register;