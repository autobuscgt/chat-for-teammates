import React, { createContext, useState, useContext, useCallback, useMemo } from 'react';

const NavigationContext = createContext(null);

export function NavigationProvider({ children }) {
    const [activeTab, setActiveTab] = useState('contacts');
    const [selectedRoom, setSelectedRoom] = useState(null);

    const openChat = useCallback((roomName) => {
        setSelectedRoom(roomName);
        setActiveTab('chats');
    }, []);

    const closeChat = useCallback(() => {
        setSelectedRoom(null);
        setActiveTab('contacts');
    }, []);

    const switchTab = useCallback((tab) => {
        setActiveTab(tab);
        if (tab !== 'chats') {
            setSelectedRoom(null);
        }
    }, []);

    const value = useMemo(() => ({
        activeTab,
        selectedRoom,
        openChat,
        closeChat,
        switchTab
    }), [activeTab, selectedRoom, openChat, closeChat, switchTab]);

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