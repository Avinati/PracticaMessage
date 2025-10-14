import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import Logo from '/public/Лого.png';
import Fav from '/public/Fav.png';
import Pfp from '/public/pfp.png';
import Send from '/public/send.png';
import Back from '/public/back.png';
import './css/chat.css';

function Chat() {
    const navigate = useNavigate();
    const { chatId } = useParams();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [chat, setChat] = useState(null);
    const [socket, setSocket] = useState(null);
    const [avatarLoading, setAvatarLoading] = useState(true);
    
    const messagesEndRef = useRef(null);
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
        if (isAuthenticated && user && chatId) {
            initializeSocket();
            loadChat();
            loadMessages();
        }
    }, [isAuthenticated, user, chatId]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

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
            newSocket.emit('join_chat', chatId);
        });

        newSocket.on('new_message', (message) => {
            setMessages(prev => [...prev, message]);
        });

        newSocket.on('messages_read', (data) => {
            setMessages(prev => prev.map(msg => 
                data.message_ids.includes(msg.message_id) 
                    ? { ...msg, is_read: true, read_at: new Date() }
                    : msg
            ));
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

    const loadChat = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/chats/${chatId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setChat(data.chat);
            } else {
                navigate('/messenger');
            }
        } catch (error) {
            console.error('Ошибка загрузки чата:', error);
            navigate('/messenger');
        }
    };

    const loadMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/chats/${chatId}/messages?limit=100`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages);
            }
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "" || !socket) return;
        
        socket.emit('send_message', {
            chat_id: parseInt(chatId),
            content: newMessage.trim(),
            message_type: 'text'
        });

        setNewMessage("");
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleAvatarLoad = () => {
        setAvatarLoading(false);
    };

    const handleAvatarError = () => {
        setAvatarLoading(false);
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading">Загрузка чата...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="main-content">
                <div className="auth-required">
                    <div className="auth-message">
                        <h2>Чат доступен только авторизованным пользователям</h2>
                        <p>Войдите в аккаунт чтобы продолжить общение</p>
                        <div className="auth-buttons">
                            <Link to="/login">
                                <button className="login-btn">Войти</button>
                            </Link>
                            <Link to="/messenger">
                                <button className="home-btn">К списку чатов</button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    const otherParticipant = chat?.participants?.find(p => p.user_id !== user.user_id);

    return (
        <>
            <div className="main-content">
                <div className="header-box">
                    <div className="header-container">
                        <Link to="/">
                            <img className="logo" src={Logo} alt="Логотип" />
                        </Link>
                        <input type="text" className="search-input" placeholder="Поиск..." />
                        <Link to="/favorite">
                            <button className="fav-btn">
                                <img src={Fav} alt="Избранное" />
                            </button>
                        </Link>
                        
                        <Link to="/profile">
                            <button className="pfp-btn">
                                <img src={user?.avatar_url || Pfp} alt="Профиль" />
                            </button>
                        </Link>
                    </div>
                </div>

                <div className="content-wrapper">
                    <div className="chat-container">
                        <div className="chat-header">
                            <Link to="/messenger">
                                <button className="back-button">
                                    <img src={Back} alt="Назад" />
                                </button>
                            </Link>
                            {chat && (
                                <div className="chat-user-info">
                                    <div className="avatar-container">
                                        {avatarLoading && (
                                            <div className="avatar-loading">Загрузка...</div>
                                        )}
                                        <img 
                                            src={otherParticipant?.avatar_url || Pfp} 
                                            alt={otherParticipant?.name} 
                                            className={`chat-user-avatar ${avatarLoading ? 'avatar-hidden' : ''}`}
                                            onLoad={handleAvatarLoad}
                                            onError={handleAvatarError}
                                        />
                                        <span className={`online-dot ${otherParticipant?.is_online ? 'online' : 'offline'}`}></span>
                                    </div>
                                    <div className="chat-user-details">
                                        <h3>
                                            {chat.chat_type === 'private' 
                                                ? `${otherParticipant?.name} ${otherParticipant?.surname || ''}`
                                                : chat.chat_name
                                            }
                                        </h3>
                                        <span className="status">
                                            {otherParticipant?.is_online ? 'в сети' : 'не в сети'}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        <div className="messages-container">
                            {messages.map((message) => (
                                <div 
                                    key={message.message_id} 
                                    className={`message ${message.user_id === user.user_id ? 'message-sent' : 'message-received'}`}
                                >
                                    <div className="message-content">
                                        {message.user_id !== user.user_id && (
                                            <span className="sender-name">
                                                {message.name} {message.surname}
                                            </span>
                                        )}
                                        <p>{message.content}</p>
                                        <span className="message-time">
                                            {formatTime(message.created_at)}
                                            {message.is_edited && <span className="edited"> (ред.)</span>}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        
                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <div className="input-container">
                                <input
                                    type="text"
                                    className="message-input"
                                    placeholder="Введите сообщение..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={!socket}
                                />
                                <button 
                                    type="submit" 
                                    className="send-button"
                                    disabled={!socket || newMessage.trim() === ""}
                                >
                                    <img src={Send} alt="Отправить" />
                                </button>
                            </div>
                        </form>
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
                                <ul>Условия пользователя</ul>
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

export default Chat;