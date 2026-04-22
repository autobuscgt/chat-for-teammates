import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import io from 'socket.io-client';
// import './Home.css'; // Создадим файл со стилями

function Home() {
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [inputMessage, setInputMessage] = useState('');
    const [currentUser, setCurrentUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [typingUsers, setTypingUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    // Загрузка пользователя из localStorage (после логина)
    useEffect(() => {

    }, []);

    // Создание тестового пользователя (для разработки)
    const createTestUser = async () => {
        try {
            const response = await axios.post('http://localhost:7000/api/auth/register', {
                login: `user_${Date.now()}`,
                password: '123456',
                role: 'user'
            });
            const user = response.data.user;
            localStorage.setItem('user', JSON.stringify(user));
            setCurrentUser(user);
        } catch (error) {
            console.error('Ошибка создания пользователя:', error);
        }
    };

    // Загрузка комнат
    const loadRooms = async () => {
        try {
            const response = await axios.get('http://localhost:7000/api/room/');
            setRooms(response.data.rooms || response.data);
        } catch (error) {
            console.error('Ошибка загрузки комнат:', error);
        }
    };

    // Загрузка сообщений комнаты
    const loadMessages = async (roomId) => {
        setIsLoading(true);
        try {
            const response = await axios.get(`http://localhost:7000/api/messages/room/${roomId}`);
            setMessages(response.data);
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Инициализация Socket.IO
    useEffect(() => {
        if (!currentUser) return;

        const newSocket = io('http://localhost:7000', {
            transports: ['websocket', 'polling']
        });
        setSocket(newSocket);

        // Подтверждение подключения
        newSocket.on('connect', () => {
            console.log('Socket.IO подключен');
            newSocket.emit('user_connected', currentUser.id);
        });

        // Получение нового сообщения
        newSocket.on('receive_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        // Статус печати
        newSocket.on('user_typing', ({ userId, isTyping }) => {
            if (isTyping && userId !== currentUser.id) {
                setTypingUsers(prev => [...new Set([...prev, userId])]);
            } else {
                setTypingUsers(prev => prev.filter(id => id !== userId));
            }
        });

        // Список активных пользователей
        newSocket.on('active_users', (users) => {
            console.log('Активные пользователи:', users);
        });

        // Очистка при размонтировании
        return () => {
            if (selectedRoom) {
                newSocket.emit('leave_room', selectedRoom);
            }
            newSocket.disconnect();
        };
    }, [currentUser]);

    // Присоединение к комнате при выборе
    useEffect(() => {
        if (!socket || !selectedRoom || !currentUser) return;

        // Присоединяемся к новой комнате
        socket.emit('join_room', selectedRoom);
        
        // Загружаем сообщения комнаты
        loadMessages(selectedRoom);
        
        // Очищаем статус печати
        setTypingUsers([]);

        // Выход из предыдущей комнаты при смене
        return () => {
            if (selectedRoom) {
                socket.emit('leave_room', selectedRoom);
            }
        };
    }, [selectedRoom, socket, currentUser]);

    // Авто-скролл при новых сообщениях
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Загрузка комнат при монтировании
    useEffect(() => {
        loadRooms();
    }, []);

    // Создание новой комнаты
    const createRoom = async () => {
        const roomName = prompt('Введите название комнаты:');
        if (!roomName) return;

        try {
            await axios.post('http://localhost:7000/api/rooms', {
                userId: currentUser.id,
                name: roomName
            });
            loadRooms(); // Перезагружаем список комнат
        } catch (error) {
            console.error('Ошибка создания комнаты:', error);
            alert('Ошибка создания комнаты');
        }
    };

    // Отправка сообщения
    const sendMessage = async (e) => {
        e.preventDefault();
        if (!inputMessage.trim() || !selectedRoom || !currentUser) return;

        const messageData = {
            text: inputMessage,
            userId: currentUser.id,
            roomId: selectedRoom,
            file: null
        };

        // Отправляем через сокет
        socket.emit('send_message', messageData);
        setInputMessage('');
    };

    // Обработка печати
    const handleTyping = () => {
        if (!socket || !selectedRoom || !currentUser) return;

        if (!typingTimeoutRef.current) {
            socket.emit('typing', { 
                roomId: selectedRoom, 
                userId: currentUser.id, 
                isTyping: true 
            });
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing', { 
                roomId: selectedRoom, 
                userId: currentUser.id, 
                isTyping: false 
            });
            typingTimeoutRef.current = null;
        }, 1000);
    };

    // Вход в комнату
    const joinRoom = (roomId) => {
        setSelectedRoom(roomId);
    };

    return (
        <div className="home-container">
            {/* Боковая панель с комнатами */}
            <div className="rooms-sidebar">
                <div className="sidebar-header">
                    <h2>Комнаты</h2>
                    <button onClick={createRoom} className="create-room-btn">
                        + Создать
                    </button>
                </div>
                
                <div className="rooms-list">
                    {rooms.length === 0 ? (
                        <p className="no-rooms">Нет комнат. Создайте первую!</p>
                    ) : (
                        rooms.map((room) => (
                            <div
                                key={room.id}
                                className={`room-item ${selectedRoom === room.id ? 'active' : ''}`}
                                onClick={() => joinRoom(room.id)}
                            >
                                <div className="room-name">{room.name}</div>
                                <div className="room-id">ID: {room.id.slice(0, 8)}...</div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Основная область чата */}
            <div className="chat-area">
                {!selectedRoom ? (
                    <div className="welcome-screen">
                        <h2>Добро пожаловать в чат!</h2>
                        <p>Выберите комнату из списка слева или создайте новую</p>
                    </div>
                ) : (
                    <>
                        {/* Заголовок чата */}
                        <div className="chat-header">
                            <div>
                                <h3>
                                    {rooms.find(r => r.id === selectedRoom)?.name || 'Чат'}
                                </h3>
                                {typingUsers.length > 0 && (
                                    <div className="typing-indicator">
                                        {typingUsers.length === 1 
                                            ? 'Кто-то печатает...' 
                                            : `${typingUsers.length} пользователей печатают...`}
                                    </div>
                                )}
                            </div>
                            <div className="user-info">
                                <span>👤 {currentUser?.login}</span>
                            </div>
                        </div>

                        {/* Сообщения */}
                        <div className="messages-container">
                            {isLoading ? (
                                <div className="loading">Загрузка сообщений...</div>
                            ) : (
                                <>
                                    {messages.length === 0 ? (
                                        <div className="no-messages">
                                            <p>Нет сообщений. Напишите первое!</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, index) => (
                                            <div
                                                key={msg.id || index}
                                                className={`message ${msg.userId === currentUser?.id ? 'my-message' : 'other-message'}`}
                                            >
                                                <div className="message-header">
                                                    <strong>{msg.userLogin || 'Пользователь'}</strong>
                                                    <small>
                                                        {new Date(msg.createdAt).toLocaleTimeString()}
                                                    </small>
                                                </div>
                                                <div className="message-text">{msg.text}</div>
                                                {msg.file && (
                                                    <a href={msg.file} target="_blank" rel="noopener noreferrer">
                                                        📎 Вложение
                                                    </a>
                                                )}
                                            </div>
                                        ))
                                    )}
                                    <div ref={messagesEndRef} />
                                </>
                            )}
                        </div>

                        {/* Форма отправки */}
                        <form onSubmit={sendMessage} className="message-form">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                onKeyPress={handleTyping}
                                placeholder="Введите сообщение..."
                                className="message-input"
                            />
                            <button type="submit" className="send-btn">
                                Отправить
                            </button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}

export default Home;