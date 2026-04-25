import { useState } from "react";
import { useLocation, useNavigate } from 'react-router-dom'
import { LOGIN_ROUTE } from "../utils/consts";
import { login, register } from "../http/userAPI";

function Auth() {
const [userLogin, setUserLogin] = useState('');
const [userPassword, setUserPassword] = useState('');
const location = useLocation();
const isLogin = location.pathname === LOGIN_ROUTE;

const navigate = useNavigate('')

const userData = {
    login: userLogin,
    password: userPassword
}

const handleSubmit = async() => {
    if(isLogin) {
        const data = await login(userData)
        if(data.token) {
            navigate('/join')
        }
    } else {
        const data = await register(userData)

        if(data.token) {
            navigate('/join')
        }
    }
}

    return (
        <div className="main-container">
            <div className="adaptive-container">
                {isLogin ? <h1>Авторизация</h1> : <h1>Регистрация</h1> }
                    <div className="auth-middle-inner">
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
                    </div>
                    <a href={isLogin ? '/register' : '/login'} className="toggle-link">
                        {isLogin ? 'Нет аккаунта?' : 'Войти' }
                    </a>
                <button onClick={handleSubmit} className="submit-btn">{isLogin ? 'Войти' : 'Зарегистрироваться'}</button>
            </div>
        </div>
    );
}

export default Auth;