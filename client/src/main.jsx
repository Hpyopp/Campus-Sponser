import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

// 👇 YE WALA PART SABSE ZAROORI HAI (Copy Paste This Logic) 👇
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Agar local hai toh localhost, nahi toh Render ka URL (Jo tere logs mein dikh raha hai)
axios.defaults.baseURL = isLocal 
  ? 'http://localhost:5000' 
  : 'https://campus-sponser-api.onrender.com'; // Tera Render URL

axios.defaults.withCredentials = false; // CORS issue avoid karne ke liye false rakha hai abhi

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
    </BrowserRouter>
  </React.StrictMode>,
);