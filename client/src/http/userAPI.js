import axios from 'axios'

export const login = async (userData) => {
    const response = await axios.post('http://localhost:7000/api/auth/login', userData);
    localStorage.setItem('token', response.data.token);
}
export const register = async (userData) => {
    const response = await axios.post('http://localhost:7000/api/auth/register', userData);
    localStorage.setItem('token', response.data.token);
}
