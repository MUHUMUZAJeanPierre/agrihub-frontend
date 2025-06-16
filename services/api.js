// services/api.js
import axios from 'axios';

const API_BASE_URL = 'https://agrihub-backend-4z99.onrender.com'; 
const token = 'Bearer YOUR_AUTH_TOKEN'; 

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: token,
    'Content-Type': 'application/json',
  },
});

export default api;
