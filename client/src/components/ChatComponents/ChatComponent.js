
import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from '../../hooks/useAuth';
import { baseURL } from '../../utils/consts';
import ModalForImage from '../ModalForImage';
import io from 'socket.io-client';

function ChatComponent({ onClose }) {
    const { user, loading } = useAuth();
    const { search } = useLocation();
    const navigate = useNavigate();
    
    const [params, setParams] = useState(null);
    const [messages, setMessages] = useState([]);
    const [imageModal, setImageModal] = useState(false);
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
                socketRef.current = null;
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

        return () => {
            if (socketRef.current && params?.room && user?.id) {
                socketRef.current.emit('leave', {
                    room: params.room,
                    userId: user.id
                });
            }
        };
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
                    text: `Доступные команды:\n
                    /help - показать это сообщение\n
                    /clear - очистить чат\n
                    /users - показать список пользователей\n
                    /me - сделать какое-то действие от своего лица\n
                    /roll - подбросить кубик\n
                    `,
                    timestamp: new Date().toLocaleString(),
                    user: 'System',
                    userId: 'system',
                    type: 'text'
                };
                setMessages(prev => [...prev, helpMessage]);
                return true;
            
            case '/me':
                const actionMessage = {
                    text: `${user.login}* ${args}`,
                    timestamp: new Date().toLocaleString(),
                    user: user.login,
                    userId: user.id,
                    type: 'action'
                };
                socketRef.current.emit('chat message', {
                    text: actionMessage.text,
                    room: params?.room,
                    timestamp: new Date().toISOString(),
                    userId: user.id,
                    user: user.login,
                    type: 'action'
                });
                return true;

            case '/users':
                socketRef.current.emit('get users', params?.room);
                return true;
                
            case '/roll':
                const max =  6;
                const result = Math.floor(Math.random() * max) + 1;
                const rollMessage = {
                    text: `${user.nickname || user.login} бросил кубик и выпало: ${result} из ${max}`,
                    timestamp: new Date().toLocaleString(),
                    user: user.login,
                    userId: user.id,
                    type: 'roll'
                };
                socketRef.current.emit('chat message', {
                    text: rollMessage.text,
                    room: params?.room,
                    timestamp: new Date().toISOString(),
                    userId: user.id,
                    user: user.login,
                    type: 'roll'
                });
                return true;
            
            case '/':

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
            setTimeout(() => {
                if (socketRef.current) {
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
                }
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

    const closeModal = () => {
        setImageModal(false);
        setSelectedImage(null);
    };

    const handleImageClick = (imageUrl) => {
        setSelectedImage(imageUrl);
        setImageModal(true);
    };

    const isMyMessage = (msg) => {
        return msg.userId === user?.id || msg.user === user?.login;
    };

    const handleCloseChat = () => {
        if (onClose) {
            onClose();
        } else {
            navigate('/contacts', { replace: true });
        }
    };

    if (loading || !user) {
        return <div className="error">Необходима авторизация</div>;
    }

    return ( 
        <div className="chat-container">
            <div className="chat-header">
                <button onClick={handleCloseChat} className="back-button">
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
                                                onClick={() => handleImageClick(msg.imageUrl)}
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
                            placeholder="Введите сообщение или команду (/help)..." 
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
                                onClick={() => document.querySelector('input[type="file"]')?.click()}
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
            
            <ModalForImage 
                image={selectedImage} 
                isOpen={imageModal} 
                onClose={closeModal}
                baseURL={baseURL}
            />
        </div>
    );
}

export default ChatComponent;