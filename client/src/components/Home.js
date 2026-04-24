import axios from 'axios';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import io from 'socket.io-client';

function Home() {
    const [id, setID] = useState('');
    return (
        <div className="main-container">
            <div className='auth-container'>
                <h1>Войти в комнату</h1>
                <div className='auth-middle-inner'>
                    <input 
                        placeholder='Введите ID комнаты' 
                        value={id} 
                        onChange={(e) => setID(e.target.value)}
                    />
                    <Link to={`/chat?room=${id}`}>
                        <button className='submit-btn' >Войти</button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Home;