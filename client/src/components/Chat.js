import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import io from 'socket.io-client'

function Chat() {
    const { search } = useLocation();
    const [params, setParams] = useState(null);
    const [messages, setMessages] = useState([]);
    const [send, setSend] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io.connect('https://tppbtl5t-7000.euw.devtunnels.ms/');
        socketRef.current.on('chat message', (msgs) => {
            setMessages(msgs);
        });
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(() => {
        const searchLocation = Object.fromEntries(new URLSearchParams(search));
        setParams(searchLocation);
        if (socketRef.current && searchLocation.room) {
            socketRef.current.emit('join', searchLocation.room);
        }
    }, [search]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (send.trim() && socketRef.current) {
            socketRef.current.emit('chat message', {
                text: send,
                room: params?.room,
                timestamp: new Date().toISOString()
            });
            setSend('');
        }
    }

    return ( 
        <div>

        <div>
            <h1>Room ID: {params?.room}</h1>
            <div className="text-container">
                <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg.text || msg}</li>
                ))}
                </ul>
            </div>

        </div>
        <div className="container-for-sending-messages">
            <form onSubmit={handleSubmit} className="send-message-container">
                <input 
                    name="send-message"
                    placeholder="Введите сообщение..." 
                    value={send} 
                    onChange={(e) => setSend(e.target.value)}
                />                
                <button type="submit" className="send-btn">
                <img src="/images/send.png" className="send-img"/>
                </button>

            </form>
        </div>

        </div>
    );
}

export default Chat;