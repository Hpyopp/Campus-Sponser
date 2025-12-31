import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ Request /api/users/login par jayegi
      const { data } = await axios.post('/api/users/login', formData);
      localStorage.setItem('user', JSON.stringify(data));
      alert("Login Success! 🚀");
      
      // Admin check
      if(data.role === 'admin' || data.email === 'pratham@example.com') {
          navigate('/admin');
      } else {
          navigate('/');
      }
      window.location.reload(); 
    } catch (err) {
      alert(err.response?.data?.message || 'Login Failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', textAlign: 'center' }}>
      <h2>🔑 Login</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="email" placeholder="Email" onChange={(e) => setFormData({...formData, email: e.target.value})} required style={{ padding: '10px' }} />
        <input type="password" placeholder="Password" onChange={(e) => setFormData({...formData, password: e.target.value})} required style={{ padding: '10px' }} />
        <button type="submit" style={{ padding: '10px', background: 'blue', color: 'white', border: 'none' }}>Login</button>
      </form>
    </div>
  );
};
export default Login;