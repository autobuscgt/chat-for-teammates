import { useState } from "react";
import { useLocation } from 'react-router-dom'
import axios from 'axios'

function Auth() {
const [userLogin, setUserLogin] = useState('');
const [userPassword, setUserPassword] = useState('');
const location = useLocation();
const isLogin = location.pathname === '/login';

const userData = {
    login:userLogin,
    password:userPassword
}

const handleSubmit = async() => {
    if(isLogin) {
        const response = await axios.post('http://localhost:7000/api/auth/login', userData);
        localStorage.setItem('token', response.data.token);
    } else {
        const response = await axios.post('http://localhost:7000/api/auth/register', userData);
        localStorage.setItem('token', response.data.token);
    }
}

    return (
        <div className="main-container">
            <div className="auth-container">
                {isLogin ? <h1>Авторизация</h1> : <h1>Регистрация</h1> }
                <input 
                    placeholder="Введите логин" 
                    value={userLogin}
                    type="text"
                    onChange={(e) => setUserLogin(e.target.value)}
                    />
                
                <input 
                    placeholder="Введите пароль"
                    type="password"
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    />

                {isLogin ? 
                <button onClick={handleSubmit}>Войти</button> 
                : 
                <button onClick={handleSubmit}>Зарегаться</button> 
            }
            </div>
        </div>
    );
}

export default Auth;