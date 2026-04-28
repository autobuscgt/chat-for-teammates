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

export default NavBar;