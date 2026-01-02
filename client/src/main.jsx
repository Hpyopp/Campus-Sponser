import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios';

// 👇 AUTOMATIC SWITCHING LOGIC
// Agar localhost pe hai toh Local Backend, nahi toh Render wala Backend
const isProduction = window.location.hostname !== 'localhost';

axios.defaults.baseURL = isProduction 
  ? 'https://campus-sponser-api.onrender.com'  // LIVE Render URL
  : 'http://localhost:5000';                   // LOCAL Laptop URL

axios.defaults.withCredentials = true; // Security ke liye zaroori

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)