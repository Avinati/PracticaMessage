import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import Plus from '/public/plus.png'
import Send from '/public/send.png'
import Back from '/public/back.png'
import './css/chat.css'

function Chat() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    const [messages, setMessages] = useState([
        { id: 1, text: "Привет! Как дела?", time: "12:30", isSent: false },
        { id: 2, text: "Привет! Все отлично, спасибо! А у тебя?", time: "12:31", isSent: true },
        { id: 3, text: "Тоже все хорошо! Хочешь встретиться завтра?", time: "12:32", isSent: false },
    ]);
    
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        checkAuthentication();
    }, []);

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

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;
        
        const newMsg = {
            id: messages.length + 1,
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true,
            sender: user?.name || 'Вы'
        };
        
        setMessages([...messages, newMsg]);
        setNewMessage("");
    };

    const handleAttachFile = () => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы отправлять файлы');
            return;
        }
        // Логика прикрепления файла
        alert('Функция прикрепления файла будет доступна скоро');
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
                            <Link to="/messanger">
                                <button className="home-btn">К списку чатов</button>
                            </Link>
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
                        <input type="text" className="search-input" placeholder="Поиск..." />
                        <Link to="/favorite">
                            <button className="fav-btn">
                                <img src={Fav} alt="Избранное" />
                            </button>
                        </Link>
                        
                        {/* Динамическая кнопка профиля */}
                        {isAuthenticated ? (
                            <Link to="/profile">
                                <button className="pfp-btn">
                                    <img src={user?.avatar_url || Pfp} alt="Профиль" />
                                </button>
                            </Link>
                        ) : (
                            <Link to="/login">
                                <button className="pfp-btn">
                                    <img src={Pfp} alt="Профиль" />
                                </button>
                            </Link>
                        )}
                    </div>
                </div>

                <div className="content-wrapper">
                    <div className="chat-container">
                        <div className="chat-header">
                            <Link to="/messanger">
                                <button className="back-button">
                                    <img src={Back} alt="Назад" />
                                </button>
                            </Link>
                            <div className="chat-user-info">
                                <div className="avatar-container">
                                    <img src={Pfp} alt="Алексей Петров" className="chat-user-avatar" />
                                    <span className="online-dot"></span>
                                </div>
                                <div className="chat-user-details">
                                    <h3>Алексей Петров</h3>
                                    <span className="status">в сети</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="messages-container">
                           
                            
                            {messages.map((message) => (
                                <div 
                                    key={message.id} 
                                    className={`message ${message.isSent ? 'message-sent' : 'message-received'}`}
                                >
                                    {!message.isSent && (
                                        <img src={Pfp} alt="Аватар" className="message-avatar" />
                                    )}
                                    <div className="message-content">
                                        {!message.isSent && (
                                            <span className="sender-name">Алексей Петров</span>
                                        )}
                                        <p>{message.text}</p>
                                        <span className="message-time">{message.time}</span>
                                    </div>
                                    {message.isSent && (
                                        <img src={user?.avatar_url || Pfp} alt="Ваш аватар" className="message-avatar" />
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <div className="input-container">
                                <button 
                                    type="button" 
                                    className="attach-button"
                                    onClick={handleAttachFile}
                                    disabled={!isAuthenticated}
                                >
                                    <img src={Plus} alt="Добавить файл" />
                                </button>
                                <input
                                    type="text"
                                    className="message-input"
                                    placeholder={isAuthenticated ? "Введите сообщение..." : "Войдите в аккаунт чтобы писать..."}
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    disabled={!isAuthenticated}
                                />
                                <button 
                                    type="submit" 
                                    className="send-button"
                                    disabled={!isAuthenticated || newMessage.trim() === ""}
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
                                <ul>
                                    {isAuthenticated ? (
                                        <Link to="/profile">Профиль</Link>
                                    ) : (
                                        <span onClick={() => navigate('/login')}>Профиль</span>
                                    )}
                                </ul>
                                <ul>
                                    {isAuthenticated ? (
                                        <Link to="/frinds">Друзья</Link>
                                    ) : (
                                        <span onClick={() => navigate('/login')}>Друзья</span>
                                    )}
                                </ul>
                                <ul>
                                    {isAuthenticated ? (
                                        <Link to="/settings">Настройки</Link>
                                    ) : (
                                        <span onClick={() => navigate('/login')}>Настройки</span>
                                    )}
                                </ul>
                                <ul><Link to="/messanger">Чаты</Link></ul>
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
    )
}

export default Chat;