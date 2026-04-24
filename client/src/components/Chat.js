import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import io from 'socket.io-client'

function ChatComponent() {
    const { search } = useLocation();
    const [params, setParams] = useState(null);
    const [messages, setMessages] = useState([]);
    const [send, setSend] = useState('');
    const socketRef = useRef(null);

    useEffect(() => {
        socketRef.current = io.connect('http://localhost:7000');
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
        <div className="chat-container">
            <h1 className="room-header">Комната: {params?.room}</h1>
            <div className="text-container">
                <ul>
                {messages.map((msg, index) => (
                    <li key={index}>{msg.text || msg}</li>
                ))}
                </ul>
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
                    <img src="/images/send.png" className="send-img" alt="send-img"/>
                </button>
            </form>
        </div>

        </div>
    );
}
const rooms = [
    {id:1, name: 'room1'},
    {id:2, name: '777'},
    {id:3, name: '999'},
    {id:4, name: 'room2'},
]

function Contacts(){
    const [search, setSearch] = useState('')

    const inputHandler = (e) => {
        let lowerText = e.target.value.toLowerCase();
        setSearch(lowerText);
    };

    const filteredData = rooms.filter((el) => {
        if(search === ''){
            return el;
        } else {
            return el.name.toLowerCase().includes(search)
        }
    })
    return (
        <div className="contacts-containers">
            <ul>
                <li> 
                    <input 
                        placeholder="Поиск..."
                        onChange={inputHandler}
                        value={search}
                        className="search-container"
                    /> 
                </li>
                {filteredData.map((msg)=> (
                    <li key={msg.id}> 
                        <a href={`/chat?room=${msg.name}`} className="room-link"> {msg.name}  </a>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function Chat (){
    return(
        <div className="main-interface-container">
            <Contacts/>
            <ChatComponent/>
        </div>
    )
}

export default Chat;