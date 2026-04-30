import io from 'socket.io-client'
import { useEffect, useState, useRef } from "react";
import { baseURL } from '../../utils/consts';
import { useNavigation } from '../../context/NavigationContext';

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

    return (
        <div className="contacts-containers">
            <ul>
                <li> 
                <label style={{width:'100%',position:'relative'}}>
                    <input 
                        placeholder="Поиск..."
                        onChange={inputHandler}
                        value={search}
                        // type='search'
                        className="search-container"
                    /> 
                    <img
                        className='search-input-icon'
                        src='/images/search-input.svg'
                        alt='search-icon'
                    />
                </label>

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
export default Contacts;