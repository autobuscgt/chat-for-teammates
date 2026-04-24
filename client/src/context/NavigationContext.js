import React, { createContext, useState, useContext } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
    const [activeTab, setActiveTab] = useState('contacts');
    const [selectedRoom, setSelectedRoom] = useState(null);

    const openChat = (roomName) => {
        setSelectedRoom(roomName);
        setActiveTab('chats');
    };

    const closeChat = () => {
        setSelectedRoom(null);
        setActiveTab('contacts');
    };

    const switchTab = (tab) => {
        setActiveTab(tab);
        if (tab !== 'chats') {
            setSelectedRoom(null);
        }
    };

    const value = {
        activeTab,
        selectedRoom,
        openChat,
        closeChat,
        switchTab
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation() {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error('useNavigation must be used within a NavigationProvider');
    }
    return context;
}