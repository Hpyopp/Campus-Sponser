import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' // Default value
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const { name, email, password, role } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. Backend ko data bhejo
     const response = await axios.post('/api/users', formData);
      
      // 2. Token save karo (Auto Login)
      localStorage.setItem('user', JSON.stringify(res.data));
      
      // 3. Home page pe bhejo
      navigate('/');
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '10px' }}>
      <h1 style={{ textAlign: 'center' }}>📝 New Account</h1>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <input 
          type="text" name="name" value={name} placeholder="Full Name" 
          onChange={onChange} required style={{ padding: '10px' }} 
        />
        <input 
          type="email" name="email" value={email} placeholder="Email Address" 
          onChange={onChange} required style={{ padding: '10px' }} 
        />
        <input 
          type="password" name="password" value={password} placeholder="Password" 
          onChange={onChange} required style={{ padding: '10px' }} 
        />
        
        {/* Dropdown for Role */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label>I am a:</label>
            <select name="role" value={role} onChange={onChange} style={{ padding: '5px', flex: 1 }}>
                <option value="student">Student 🎓</option>
                <option value="sponsor">Sponsor 💰</option>
            </select>
        </div>

        <button type="submit" style={{ padding: '10px', background: '#28a745', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          Register & Login
        </button>
      </form>
    </div>
  );
};

export default Register;