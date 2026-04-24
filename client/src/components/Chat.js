import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isMobile } from 'react-device-detect';
import io from 'socket.io-client'
import { NavigationProvider, useNavigation } from "../context/NavigationContext";
import Settings from './Settings'

function ChatComponent() {
    const { search } = useLocation();
    const { closeChat } = useNavigation();
    const [params, setParams] = useState(null);
    const [messages, setMessages] = useState([]);
    const [greet, setGreet] = useState('');
    const [send, setSend] = useState('');
    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const prevMessagesLengthRef = useRef(0);
    const isFirstLoadRef = useRef(true);
    

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current) {
            scrollToBottom();
            isFirstLoadRef.current = false; 
        }
        prevMessagesLengthRef.current = messages.length;
        console.log(messagesEndRef);
        
    },[messages, isFirstLoadRef])

    useEffect(() => {
        socketRef.current = io.connect('https://tppbtl5t-7000.euw.devtunnels.ms/');
        socketRef.current.on('chat message', (msgs) => {
            const formattedMessage = msgs.map(msg => ({
                    text: msg.text,
                    timestamp:new Date(msg.timestamp).toLocaleString(),
                    user:msg.user
            }))
            setMessages(formattedMessage);
        });
        return () => {
            socketRef.current.disconnect();
        };
    }, []);

    useEffect(()=> {
        if (socketRef.current) {
            socketRef.current.on('message', (msg) => {
                setGreet(msg)
            });
        }
    },[])
    
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
            <div className="chat-header">
                <button onClick={closeChat} className="back-button">
                    ← Назад
                </button>
                <h1 className="room-header"> {params?.room}</h1>
            </div>
            
            <div className="text-container">
                <div className="greet-msg">{greet.message}</div>
                 {messages.length === 0 ? 
                    <div className="no-messages">Нет сообщений. Напишите первым!</div>
                 : 
                <div>
                    {messages.map((msg, index) => (
                        <div key={index} className="message-card">
                            <ul>
                                <li>Пользователь: {msg.user}</li>
                                <li data="text">{msg.text || msg}</li>
                                <li data="time">{msg.timestamp}</li>
                            </ul>
                        </div>
                    ))}  
                <div ref={messagesEndRef}/>
                </div>
                }
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

function Contacts(){
    const [search, setSearch] = useState('')
    const [rooms, setRooms] = useState([]);
    const socketRef = useRef(null);
    const { openChat } = useNavigation();  

    const inputHandler = (e) => {
        let lowerText = e.target.value.toLowerCase();
        setSearch(lowerText);
    };

    useEffect(() => {
        socketRef.current = io.connect('https://tppbtl5t-7000.euw.devtunnels.ms/');
        socketRef.current.on('rooms list', (_rooms) => {
            console.log(_rooms);
            const roomsWithIds = _rooms.map((roomName, index) => ({
                id: index,
                name: roomName
            }));
            setRooms(roomsWithIds);
        });
    },[]);

    const handleRoomClick = (roomName) => {
        openChat(roomName); 
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
                        <button
                            className="room-link"
                            onClick={() => handleRoomClick(msg.name)}
                            > 
                        {msg.name}  
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

function NavBar({ activeTab, onTabChange }) {
    return (
        <div className="navigation-bar">
            <button 
                className={`navigation-bar-btn ${activeTab === 'contacts' ? 'active' : ''}`}
                onClick={() => onTabChange('contacts')}
                data-image="Contacts"
            >
                Чаты
            </button>
            <button 
                className={`navigation-bar-btn ${activeTab === 'settings' ? 'active' : ''}`}
                onClick={() => onTabChange('settings')}
                data-image="Settings"
            >
                Настройки
            </button>
        </div>
    );
}

function ChatContent() {
    const { activeTab, selectedRoom, switchTab, openChat } = useNavigation();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const roomFromUrl = params.get('room');
        
        if (roomFromUrl && !selectedRoom) {
            openChat(roomFromUrl);
        }
    }, [location.search]);

    useEffect(() => {
        if (selectedRoom) {
            navigate(`/chat?room=${selectedRoom}`);
        } else if (activeTab === 'contacts') {
            navigate('/chat');
        }
    }, [selectedRoom, navigate]);

    const renderContent = () => {
        if (activeTab === 'contacts') {
            return <Contacts />;
        }
        
        if (activeTab === 'chats' && selectedRoom) {
            return <ChatComponent />;
        }
        
        if (activeTab === 'settings') {
            return <Settings />;
        }
        
        return <Contacts />;
    };
    
    const showNavBar = activeTab !== 'chats' || !selectedRoom;
    
    return (
        <>
            {isMobile ?
                <div className="main-interface-container-mobile">
                    <div className="mobile-content">
                        {renderContent()}
                    </div>
                    {showNavBar && <NavBar activeTab={activeTab} onTabChange={switchTab} />}
                </div>
                :
                <div className="main-interface-container-desktop">
                    <Contacts />
                    {selectedRoom ? <ChatComponent /> : <div className="empty-chat"></div>}
                </div>
            }
        </>
    );
}
    
function Chat(){
    return (
        <NavigationProvider>
            <ChatContent/>
        </NavigationProvider>
    )
}

export default Chat;