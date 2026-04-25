import axios from 'axios'
import { baseURL } from '../utils/consts';
const baseURL_ = baseURL;

const api = axios.create({
    baseURL: baseURL_
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const login = async (userData) => {
    const response = await axios.post(`${baseURL_}/api/auth/login`, userData);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user',JSON.stringify(response.data.user))
    return response.data;
}
export const register = async (userData) => {
    const response = await axios.post(`${baseURL_}/api/auth/register`, userData);
    localStorage.setItem('token', response.data.token);
    localStorage.setItem('user',JSON.stringify(response.data.user))
    return response.data;
}

export const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
}