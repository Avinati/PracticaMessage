import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Logo from '/public/Лого.png';
import Fav from '/public/Fav.png';
import Pfp from '/public/pfp.png';
import ForYou from '/public/person.png';
import Friends from '/public/friends.png';
import Chat from '/public/chatred.png';
import setting from '/public/settings.png'

import './css/messanger.css';

function Messenger() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chats, setChats] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState(new Set());

    const socketRef = useRef(null);

    useEffect(() => {
        checkAuthentication();
        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, []);

    useEffect(() => {
        if (isAuthenticated && user) {
            initializeSocket();
            loadChats();
        }
    }, [isAuthenticated, user]);

    const initializeSocket = () => {
        const token = localStorage.getItem('token');
        const newSocket = io('http://localhost:5000', {
            auth: {
                token: token
            }
        });

        newSocket.on('connect', () => {
            console.log('✅ Подключен к серверу чатов');
            newSocket.emit('authenticate', token);
        });

        newSocket.on('authenticated', () => {
            console.log('✅ Аутентификация socket успешна');
        });

        newSocket.on('new_message', (message) => {
            console.log('Новое сообщение:', message);
            loadChats();
        });

        newSocket.on('user_online', (data) => {
            setOnlineUsers(prev => new Set([...prev, data.user_id]));
        });

        newSocket.on('user_offline', (data) => {
            setOnlineUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(data.user_id);
                return newSet;
            });
        });

        newSocket.on('chat_notification', (data) => {
            if (Notification.permission === 'granted') {
                new Notification(`Новое сообщение от ${data.sender}`, {
                    body: data.message,
                    icon: Pfp
                });
            }
        });

        socketRef.current = newSocket;
        setSocket(newSocket);
    };

    const checkAuthentication = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsAuthenticated(true);
                const userData = localStorage.getItem('user');
                if (userData) {
                    setUser(JSON.parse(userData));
                }
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const loadChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/chats', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setChats(data.chats);
                const onlineUserIds = new Set();
                data.chats.forEach(chat => {
                    chat.participants.forEach(participant => {
                        if (participant.is_online) {
                            onlineUserIds.add(participant.user_id);
                        }
                    });
                });
                setOnlineUsers(onlineUserIds);
            }
        } catch (error) {
            console.error('Ошибка загрузки чатов:', error);
        }
    };

    const searchUsers = async (query) => {
        if (query.length < 2) {
            setSearchResults([]);
            setShowSearchResults(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/search?query=${encodeURIComponent(query)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.users);
                setShowSearchResults(true);
            }
        } catch (error) {
            console.error('Ошибка поиска пользователей:', error);
        }
    };

    const createChat = async (participantId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/chats', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    participant_ids: [participantId],
                    chat_type: 'private'
                })
            });

            const data = await response.json();

            if (response.ok) {
                setShowSearchResults(false);
                setSearchQuery('');
                navigate(`/chat/${data.chat.chat_id}`);
            } else {
                if (data.chat_id) {
                    navigate(`/chat/${data.chat_id}`);
                } else {
                    alert(data.error || 'Ошибка создания чата');
                }
            }
        } catch (error) {
            console.error('Ошибка создания чата:', error);
            alert('Ошибка создания чата');
        }
    };

    const handleChatClick = (chatId) => {
        navigate(`/chat/${chatId}`);
    };

    const formatLastSeen = (lastSeen) => {
        if (!lastSeen) return '';
        const date = new Date(lastSeen);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'только что';
        if (diffMins < 60) return `${diffMins} мин назад`;
        if (diffHours < 24) return `${diffHours} ч назад`;
        if (diffDays < 7) return `${diffDays} дн назад`;
        return date.toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <div className="loading-text">Загрузка чатов...</div>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="main-content">
                <div className="auth-required">
                    <div className="auth-message">
                        <h2>🔐 Требуется авторизация</h2>
                        <p>Чаты доступны только авторизованным пользователям. Войдите в свой аккаунт чтобы продолжить.</p>
                        <div className="auth-buttons">
                            <button 
                                className="login-btn" 
                                onClick={() => navigate('/login')}
                            >
                                Войти в аккаунт
                            </button>
                            <button 
                                className="register-btn"
                                onClick={() => navigate('/register')}
                            >
                                Создать аккаунт
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="main-content">
                <div className="header-box">
                    <div className="header-container">
                        <Link to="/">
                            <img className="logo" src={Logo} alt="Логотип" />
                        </Link>
                        <input 
                            type="text" 
                            className="search-input" 
                            placeholder="Поиск..." 
                        />
                        <Link to="/favorite">
                            <button className="fav-btn">
                                <img src={Fav} alt="Избранное" />
                            </button>
                        </Link>
                        
                        <Link to="/profile">
                            <button className="pfp-btn">
                                <img src={user?.avatar_url || Pfp} alt="Профиль" />
                                <span className="user-online-dot"></span>
                            </button>
                        </Link>
                    </div>
                </div>
                
                <div className="content-wrapper">
                    <div className="menu">
                        <Link to="/" className="menu-link">
                            <button className="foryou-btn">
                                <img src={ForYou} alt="Для вас" />
                            </button>
                            <p className="text">Для вас</p>
                        </Link>
                        
                        <Link to="/friends" className="menu-link">
                            <button className="friends-btn">
                                <img src={Friends} alt="Друзья" />
                            </button>
                            <p className="text">Друзья</p>
                        </Link>
                        
                        <div className="menu-link active">
                            <button className="chat-btn">
                                <img src={Chat} alt="Чаты" />
                            </button>
                            <p className="text1">Чаты</p>
                        </div>
                        
                        <Link to="/settings" className="menu-link">
                            <button className="set-btn">
                                <img src={setting} alt="Настройки" />
                            </button>
                            <p className="text">Настройки</p>
                        </Link>
                    </div>
                    
                    <div className="chats-container">
                        <div className="chats-controls">
                            <div className="search-container">
                                <input 
                                    type="text" 
                                    className="chats-search" 
                                    placeholder="Поиск пользователей..." 
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        searchUsers(e.target.value);
                                    }}
                                    onFocus={() => setShowSearchResults(true)}
                                />
                            </div>
                        </div>

                        {showSearchResults && searchResults.length > 0 && (
                            <div className="search-results">
                                {searchResults.map(user => (
                                    <div 
                                        key={user.user_id} 
                                        className="search-result-item"
                                        onClick={() => createChat(user.user_id)}
                                    >
                                        <div className="user-avatar">
                                            <img src={user.avatar_url || Pfp} alt="Аватар" />
                                            <span className={`online-status ${onlineUsers.has(user.user_id) ? 'online' : 'offline'}`}></span>
                                        </div>
                                        <div className="user-info">
                                            <div className="user-name">
                                                {user.name} {user.surname}
                                                {user.nick && <span className="user-nick">@{user.nick}</span>}
                                            </div>
                                            <div className="user-status">
                                                {onlineUsers.has(user.user_id) ? 'в сети' : `был(а) ${formatLastSeen(user.last_seen)}`}
                                            </div>
                                        </div>
                                        <button className="start-chat-btn">Начать чат</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {showSearchResults && searchQuery.length >= 2 && searchResults.length === 0 && (
                            <div className="no-results">
                                Пользователи не найдены
                            </div>
                        )}
                        
                        <div className="chats-list">
                            {chats.length > 0 ? (
                                chats.map(chat => {
                                    const otherParticipant = chat.participants[0];
                                    const isOnline = onlineUsers.has(otherParticipant?.user_id);
                                    
                                    return (
                                        <div 
                                            key={chat.chat_id} 
                                            className={`chat-item ${chat.unread_count > 0 ? 'unread' : ''}`}
                                            onClick={() => handleChatClick(chat.chat_id)}
                                        >
                                            {chat.unread_count > 0 && (
                                                <span className="unread-badge">{chat.unread_count}</span>
                                            )}
                                            <div className="chat-avatar">
                                                <img src={otherParticipant?.avatar_url || Pfp} alt="Аватар" />
                                                <span className={`online-status ${isOnline ? 'online' : 'offline'}`}></span>
                                            </div>
                                            <div className="chat-info">
                                                <div className="chat-header-info">
                                                    <span className="chat-name">
                                                        {chat.chat_type === 'private' 
                                                            ? `${otherParticipant?.name} ${otherParticipant?.surname || ''}`
                                                            : chat.chat_name
                                                        }
                                                    </span>
                                                    <span className="chat-time">
                                                        {chat.last_message_time 
                                                            ? new Date(chat.last_message_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                            : new Date(chat.created_at).toLocaleDateString()
                                                        }
                                                    </span>
                                                </div>
                                                <p className="chat-last-message">
                                                    {chat.last_message || 'Чат создан'}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="no-chats">
                                    <div className="no-chats-icon">💬</div>
                                    <h3>У вас пока нет чатов</h3>
                                    <p>Начните общение, найдя пользователя через поиск!</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="footer-box">
                    <div className="footer-container">
                        <img className="logo2" src={Logo} alt="Логотип" />
                        <div className="footer-columns">
                            <div className="footer-column">
                                <li>Страницы</li>
                                <ul><Link to="/">Главная</Link></ul>
                                <ul><Link to="/favorite">Избранное</Link></ul>
                                <ul><Link to="/profile">Профиль</Link></ul>
                                <ul><Link to="/friends">Друзья</Link></ul>
                                <ul><Link to="/settings">Настройки</Link></ul>
                                <ul><Link to="/messenger">Чаты</Link></ul>
                            </div>
                            <div className="footer-column">
                                <li>Документация</li>
                                <ul>Условия пользования</ul>
                                <ul>Условия использования</ul>
                                <ul>Политика куки</ul>
                                <ul>Политика конфиденциальности</ul>
                                <ul>О нас</ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Messenger;