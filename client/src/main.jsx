// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import axios from 'axios';

// Vercel Connection Setup
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
axios.defaults.baseURL = isLocal 
  ? 'http://localhost:5000' 
  : 'https://campus-sponser-api.onrender.com';
axios.defaults.withCredentials = false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* ❌ YAHAN ROUTER MAT LAGANA KYUNKI APP.JSX MEIN HAI */}
    <App />
  </React.StrictMode>,
);