import {  useState } from 'react';
import { Link } from 'react-router-dom';
// import {jwtDecode} from 'jwt-decode';

function Home() {
    const [id, setID] = useState('');

    // const token = localStorage.getItem('token');
    // const decoded = jwtDecode(token);
    // console.log(decoded);

    return (
        <div className="main-container">
            <div className='adaptive-container'>
                <h1>Войти в комнату</h1>
                <div className='auth-middle-inner'>
                    <input 
                        placeholder='Введите ID комнаты' 
                        value={id} 
                        onChange={(e) => setID(e.target.value)}
                    />
                    <Link to={`/chat?room=${id}`}>
                        <button className='submit-btn'> Войти </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;