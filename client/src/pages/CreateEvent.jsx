import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const CreateEvent = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    location: '',
    budget: '',
    category: 'Other'
  });

  const { title, description, date, location, budget, category } = formData;

  const onChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem('user')); // Token nikalo

    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`, // Token header mein bhejo
        },
      };

      await axios.post('/api/events', formData, config);
      navigate('/'); // Event banne ke baad Home page pe jao
      window.location.reload();
    } catch (error) {
      alert("Error: " + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '50px auto', padding: '20px', boxShadow: '0 0 10px rgba(0,0,0,0.1)', borderRadius: '10px' }}>
      <h1 style={{ textAlign: 'center' }}>📢 Create New Event</h1>
      <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <input type="text" name="title" value={title} onChange={onChange} placeholder="Event Title" required style={styles.input} />
        
        <textarea name="description" value={description} onChange={onChange} placeholder="Description" required style={{...styles.input, height: '80px'}} />
        
        <label>Event Date:</label>
        <input type="date" name="date" value={date} onChange={onChange} required style={styles.input} />
        
        <input type="text" name="location" value={location} onChange={onChange} placeholder="Location (e.g. Audi, Zoom)" required style={styles.input} />
        
        <input type="number" name="budget" value={budget} onChange={onChange} placeholder="Budget Needed (₹)" required style={styles.input} />
        
        <select name="category" value={category} onChange={onChange} style={styles.input}>
            <option value="Technical">Technical 💻</option>
            <option value="Cultural">Cultural 🎨</option>
            <option value="Sports">Sports 🏏</option>
            <option value="Workshop">Workshop 🛠️</option>
            <option value="Other">Other ❓</option>
        </select>

        <button type="submit" style={styles.btn}>🚀 Post Event</button>
      </form>
    </div>
  );
};

const styles = {
  input: { padding: '10px', fontSize: '16px', borderRadius: '5px', border: '1px solid #ccc' },
  btn: { padding: '12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '5px', fontSize: '16px', cursor: 'pointer' }
};

export default CreateEvent;