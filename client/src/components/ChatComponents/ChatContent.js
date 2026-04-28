// ChatLayout.jsx
import { isMobile } from 'react-device-detect';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useNavigation } from '../../context/NavigationContext';
import Settings from '../Settings';
import Contacts from './Contacts';
import NavBar from '../NavBar';
import ChatComponent from './ChatComponent';

function ChatLayout() {
    const { activeTab, selectedRoom, switchTab, openChat, closeChat } = useNavigation();
    const location = useLocation();
    const navigate = useNavigate();
    const [chatKey, setChatKey] = useState(0);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const roomFromUrl = params.get('room');
        
        if (roomFromUrl && !selectedRoom) {
            openChat(roomFromUrl);
            setChatKey(Date.now());
        }
    }, [location.search]);

    useEffect(() => {
        if (selectedRoom) {
            navigate(`/chat?room=${selectedRoom}`, { replace: true });
            setChatKey(Date.now());
        } else if (activeTab === 'contacts' && !selectedRoom) {
            navigate('/contacts', { replace: true });
        }
    }, [selectedRoom, navigate, activeTab]);

    const renderContent = () => {
        if (activeTab === 'contacts') {
            return <Contacts />;
        }
        
        if (activeTab === 'chats' && selectedRoom) {
            return <ChatComponent key={chatKey} onClose={closeChat} />;
        }
        
        if (activeTab === 'settings') {
            return <Settings />;
        }
        
        return <Contacts />;
    };
    
    const showNavBar = activeTab !== 'chats' || !selectedRoom;
    
    return (
        <>
            {isMobile ? (
                <div className="main-interface-container-mobile">
                    <div className="mobile-content">
                        {renderContent()}
                    </div>
                    {showNavBar && <NavBar activeTab={activeTab} onTabChange={switchTab} />}
                </div>
            ) : (
                <div className="main-interface-container-desktop">
                    <Contacts />
                    {selectedRoom ? (
                        <ChatComponent key={chatKey} onClose={closeChat} />
                    ) : (
                        <div className="empty-chat">Выберите чат</div>
                    )}
                </div>
            )}
        </>
    );
}

export default ChatLayout;