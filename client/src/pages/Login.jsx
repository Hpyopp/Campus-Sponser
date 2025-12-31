import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // ✅ CORRECT ADDRESS: /api/users/login (Pehle /api/auth/login tha)
      const { data } = await axios.post('/api/users/login', formData);
      
      localStorage.setItem('user', JSON.stringify(data));
      alert("Login Successful! 🚀");
      navigate('/');
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '100px auto', padding: '20px', boxShadow: '0 0 10px #ccc' }}>
      <h2 style={{ textAlign: 'center' }}>🔑 Login</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="Email" style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
        <input type="password" placeholder="Password" style={{ width: '100%', marginBottom: '10px', padding: '10px' }}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
        <button type="submit" style={{ width: '100%', padding: '10px', background: '#2563eb', color: 'white', border: 'none' }}>
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;