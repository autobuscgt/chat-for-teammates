import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { isMobile } from 'react-device-detect';
import io from 'socket.io-client'
import { NavigationProvider, useNavigation } from "../context/NavigationContext";
import Settings from './Settings'
import { useAuth } from "../hooks/useAuth";
import { baseURL } from "../utils/consts";

function ChatComponent() {
    const { user, loading } = useAuth();
    const { search } = useLocation();
    const { closeChat } = useNavigation();

    const [params, setParams] = useState(null);
    const [messages, setMessages] = useState([]);
    const [greet, setGreet] = useState('');
    const [send, setSend] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);

    const socketRef = useRef(null);
    const messagesEndRef = useRef(null);
    const prevMessagesLengthRef = useRef(0);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        if (messages.length > prevMessagesLengthRef.current) {
            scrollToBottom();
        }
        prevMessagesLengthRef.current = messages.length;
    }, [messages]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            socketRef.current = io.connect(baseURL, {
                auth: { token }
            });
            
            socketRef.current.on('chat message', (msgs) => {
                const formattedMessage = msgs.map(msg => ({
                    text: msg.text,
                    timestamp: new Date(msg.timestamp).toLocaleString(),
                    user: msg.user,
                    userId: msg.userId,
                    imageUrl: msg.imageUrl,
                    type: msg.type || 'text'
                }));
                setMessages(formattedMessage);
            });
            
            socketRef.current.on('message', (msg) => {
                setGreet(msg);
            });

            socketRef.current.on('image uploaded', (data) => {
                console.log('Image uploaded successfully:', data);
                setSelectedImage(null);
                setImagePreview(null);
            });

            socketRef.current.on('error', (error) => {
                console.error('Socket error:', error);
                alert(error.message);
            });
        }
        
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        const searchLocation = Object.fromEntries(new URLSearchParams(search));
        setParams(searchLocation);
        
        if (socketRef.current && searchLocation.room && user) {
            socketRef.current.emit('join', {
                room: searchLocation.room,
                user: {
                    id: user.id,
                    login: user.login,
                    nickname: user.nickname
                }
            });
        }
    }, [search, user]);

    const handleCommand = (command, args) => {
        switch(command) {
            case '/clear':
                setMessages([]);
                socketRef.current.emit('clear chat', {
                    room: params?.room,
                    userId: user.id
                });
                return true;
                
            case '/help':
                const helpMessage = {
                    text: 'Доступные команды:\n/help - показать это сообщение\n/clear - очистить чат\n/users - показать список пользователей\n',
                    timestamp: new Date().toLocaleString(),
                    user: 'System',
                    userId: 'system',
                    type: 'text'
                };
                setMessages(prev => [...prev, helpMessage]);
                return true;
                
            case '/users':
                socketRef.current.emit('get users', params?.room);
                return true;

            case '/durov':
                // socketRef.current.emit('durov');
                return true;
            default:
                return false;
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (send.startsWith('/')) {
            const [command, ...argsArray] = send.split(' ');
            const args = argsArray.join(' ');
            const handled = handleCommand(command, args);
            
            if (handled) {
                setSend('');
                return;
            }
        }
        if (selectedImage) {
            sendImage();
        }
        if (send.trim() && socketRef.current && user) {
            socketRef.current.emit('chat message', {
                text: send,
                room: params?.room,
                timestamp: new Date().toISOString(),
                userId: user.id,
                user: user.nickname || user.login
            });
            setSend('');
        }
    }

    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    const sendImage = async () => {
        if (!selectedImage) return;

        try {
            const base64Image = await fileToBase64(selectedImage);
            setTimeout(()=>{
                socketRef.current.emit('chat image', {
                    file: base64Image,
                    metadata: {
                        room: params?.room,
                        timestamp: new Date().toISOString(),
                        userId: user.id,
                        user: user.nickname || user.login,
                        filename: selectedImage.name,
                        fileType: selectedImage.type
                    }
                });
            }, 1000);
        } catch (error) {
            console.error('Error sending image:', error);
            alert('Ошибка при отправке изображения');
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Пожалуйста, выберите изображение');
            return;
        }

        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            alert('Размер изображения не должен превышать 5MB');
            return;
        }

        setSelectedImage(file);

        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target.result);
        };
        reader.readAsDataURL(file);

        e.target.value = '';
    };

    const cancelImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
    };

    const isMyMessage = (msg) => {
        return msg.userId === user?.id || msg.user === user?.login;
    };

    if (loading) {
        return <div className="loading">Загрузка...</div>;
    }

    if (!user) {
        return <div className="error">Необходима авторизация</div>;
    }

    return ( 
        <div className="chat-container">
            <div className="chat-header">
                <button onClick={closeChat} className="back-button">
                    ← Назад
                </button>
                <h1 className="room-header">Комната: {params?.room}</h1>
            </div>
            
            <div className="text-container">
                <div className="greet-msg">{greet.message}!</div>
                {messages.length === 0 ? 
                    <div className="no-messages">Нет сообщений. Напишите первым!</div>
                    : 
                    <div className="messages-container">
                        {messages.map((msg, index) => (
                            <div key={index} className={`message-card ${isMyMessage(msg) ? 'yes' : 'no'}`}>
                                <ul>
                                    <li>{msg.user}</li>
                                    {msg.type === 'image' && msg.imageUrl ? (
                                        <li className="message-image"> 
                                            <img 
                                                src={`${baseURL}${msg.imageUrl}`} 
                                                alt="message-photo"
                                                style={{ maxWidth: '100%', maxHeight: '300px', cursor: 'pointer' }}
                                                onClick={() => window.open(`${baseURL}${msg.imageUrl}`, '_blank')}
                                            /> 
                                        </li> 
                                    ) : (
                                        <li data="text">{msg.text}</li>
                                    )}
                                    <li data="time">{msg.timestamp}</li>
                                </ul>
                            </div>
                        ))}  
                        <div ref={messagesEndRef}/>
                    </div>
                }
            </div>
            <div className="messages-footer">
            {imagePreview && (
                <div className="image-preview-container">
                    <div className="image-preview">
                        <img src={imagePreview} alt="Preview" />
                        <div className="image-preview-info">
                            {selectedImage?.name}
                        </div>
                        <button 
                            type="button" 
                            className="cancel-image-btn"
                            onClick={cancelImage}
                        >
                            Отменить
                        </button>
                    </div>
                </div>
            )}
            <div className="quick-emojis">
                <button type="button" onClick={() => setSend(prev => prev + '🤟')} className="quick-emoji">🤟</button>
                <button type="button" onClick={() => setSend(prev => prev + '👀')} className="quick-emoji">👀</button>
                <button type="button" onClick={() => setSend(prev => prev + '❤️')} className="quick-emoji">❤️</button>
                <button type="button" onClick={() => setSend(prev => prev + '🤏')} className="quick-emoji">🤏</button>
                <button type="button" onClick={() => setSend(prev => prev + '💩')} className="quick-emoji">💩</button>
                <button type="button" onClick={() => setSend(prev => prev + '☢️')} className="quick-emoji">☢️</button>
                <button type="button" onClick={() => setSend(prev => prev + '🕑')} className="quick-emoji">🕑</button>
            </div>
            <div className="container-for-sending-messages">
                <form onSubmit={handleSubmit} className="send-message-container">
                    <input 
                        className="text-input"
                        placeholder="Введите сообщение..." 
                        value={send} 
                        onChange={(e) => setSend(e.target.value)}
                    />                
                    
                    <label className="image-upload-label">
                        <input 
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            style={{ display: 'none' }}
                        />
                        <button 
                            type="button" 
                            className="image-upload-btn"
                            onClick={() => document.querySelector('input[type="file"]').click()}
                        >
                            📷
                        </button>
                    </label>
                
                    <button type="submit" className="send-btn">
                        <img src="/images/send.png" className="send-img" alt="send-img"/>
                    </button>
                </form>
            </div>
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
        const token = localStorage.getItem('token');
        if (token) {
            socketRef.current = io.connect(baseURL, {
                auth: { token }
            });
            
            socketRef.current.on('rooms list', (_rooms) => {
                const roomsWithIds = _rooms.map((roomName, index) => ({
                    id: index,
                    name: roomName
                }));
                setRooms(roomsWithIds);
            });
            
            socketRef.current.emit('get rooms');
        }
        
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    const handleRoomClick = (roomName) => {
        openChat(roomName);
    };

    const filteredData = rooms.filter((el) => {
        if(search === ''){
            return el;
        } else {
            return el.name.toLowerCase().includes(search);
        }
    });

    // useEffect(()=> {
        
    // },[])

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
    );
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
    }, [location.search, openChat, selectedRoom]);

    useEffect(() => {
        if (selectedRoom) {
            navigate(`/chat?room=${selectedRoom}`);
        } else if (activeTab === 'contacts') {
            navigate('/chat');
        }
    }, [selectedRoom, navigate, activeTab]);

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