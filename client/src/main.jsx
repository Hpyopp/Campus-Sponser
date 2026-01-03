import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
// BrowserRouter hata diya kyunki wo App.jsx mein pehle se hai
import axios from 'axios';
import { Toaster } from 'react-hot-toast';

// 👇 VERCEL CONNECTION LOGIC (YE ZAROORI HAI)
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

axios.defaults.baseURL = isLocal 
  ? 'http://localhost:5000' 
  : 'https://campus-sponser-api.onrender.com'; // Tera Render URL

axios.defaults.withCredentials = false;

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
      {/* Sirf App aur Toaster rakho, Router hatao */}
      <App />
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
  </React.StrictMode>,
);