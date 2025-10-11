import React, { useState, useEffect } from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import ForYou from '/public/person.png'
import Friends from '/public/friends.png'
import Chat from '/public/chatred.png'
import Set from '/public/settings.png'
import './css/messanger.css'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'

function Messenger() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const chats = [
        { id: 1, name: "Алексей Петров", lastMessage: "Привет! Как дела?", unread: 2, online: true, time: "12:30" },
        { id: 2, name: "Мария Иванова", lastMessage: "Встречаемся завтра?", unread: 0, online: true, time: "11:45" },
        { id: 3, name: "Иван Сидоров", lastMessage: "Отправил файл", unread: 1, online: false, time: "10:20" },
        { id: 4, name: "Екатерина Белова", lastMessage: "Спасибо за помощь!", unread: 0, online: true, time: "09:15" },
        { id: 5, name: "Дмитрий Козлов", lastMessage: "Когда будет готово?", unread: 3, online: false, time: "08:30" }
    ];

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        const token = localStorage.getItem('token');
        console.log('Токен из localStorage:', token);
        
        if (!token) {
            console.log('Токен не найден, перенаправляем на логин');
            setIsAuthenticated(false);
            setLoading(false);
            navigate('/login');
            return;
        }

        try {
            console.log('Проверяем токен на сервере...');
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('Статус ответа verify:', response.status);

            if (response.ok) {
                console.log('Токен валиден');
                setIsAuthenticated(true);
                
                // Получаем актуальные данные пользователя
                const profileResponse = await fetch('http://localhost:5000/api/users/profile', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (profileResponse.ok) {
                    const userData = await profileResponse.json();
                    setUser(userData.user);
                    localStorage.setItem('user', JSON.stringify(userData.user));
                    console.log('Данные пользователя обновлены:', userData.user);
                } else {
                    // Используем сохраненные данные если запрос профиля не удался
                    const savedUser = localStorage.getItem('user');
                    if (savedUser) {
                        setUser(JSON.parse(savedUser));
                        console.log('Используем сохраненные данные пользователя');
                    }
                }
            } else {
                console.log('Токен невалиден, очищаем localStorage');
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/login');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            // При ошибке сети проверяем есть ли сохраненные данные
            const savedUser = localStorage.getItem('user');
            if (savedUser) {
                console.log('Ошибка сети, используем сохраненные данные');
                setIsAuthenticated(true);
                setUser(JSON.parse(savedUser));
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChatClick = (chatId, chatName) => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы открыть чат');
            navigate('/login');
            return false;
        }
        // Переходим в конкретный чат
        navigate(`/chat/${chatId}`);
        return true;
    };

    const handleNewChat = () => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы создать новый чат');
            navigate('/login');
            return;
        }
        // Логика создания нового чата
        alert('Функция создания нового чата будет доступна скоро');
    };

    const handleSearchChats = (e) => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы искать чаты');
            navigate('/login');
            return;
        }
        // Логика поиска чатов
        console.log('Поиск чатов:', e.target.value);
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
                            onFocus={() => !isAuthenticated && navigate('/login')}
                        />
                        <Link to="/favorite">
                            <button className="fav-btn">
                                <img src={Fav} alt="Избранное" />
                            </button>
                        </Link>
                        
                        {/* Динамическая кнопка профиля */}
                        <Link to={isAuthenticated ? "/profile" : "/login"}>
                            <button className="pfp-btn">
                                <img 
                                    src={isAuthenticated ? (user?.avatar_url || Pfp) : Pfp} 
                                    alt="Профиль" 
                                />
                                {isAuthenticated && user && (
                                    <span className="user-online-dot"></span>
                                )}
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
                        
                        <Link to="/frinds" className="menu-link">
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
                                <img src={Set} alt="Настройки" />
                            </button>
                            <p className="text">Настройки</p>
                        </Link>
                    </div>
                    
                    <div className="chats-container">
                       
                        
                        <div className="chats-controls">
                            <input 
                                type="text" 
                                className="chats-search" 
                                placeholder="Поиск чатов..." 
                                onChange={handleSearchChats}
                                onFocus={() => !isAuthenticated && navigate('/login')}
                            />
                            <button 
                                className="new-chat-btn"
                                onClick={handleNewChat}
                            >
                                + Новый чат
                            </button>
                        </div>
                        
                        <div className="chats-list">
                            {chats.length > 0 ? (
                                chats.map(chat => (
                                    <div 
                                        key={chat.id} 
                                        className={`chat-item ${chat.unread > 0 ? 'unread' : ''}`}
                                        onClick={() => handleChatClick(chat.id, chat.name)}
                                    >
                                        {chat.unread > 0 && (
                                            <span className="unread-badge">{chat.unread}</span>
                                        )}
                                        <div className="chat-avatar">
                                            <img src={Pfp} alt="Аватар" />
                                            <span className={`online-status ${chat.online ? 'online' : 'offline'}`}></span>
                                        </div>
                                        <div className="chat-info">
                                            <div className="chat-header-info">
                                                <span className="chat-name">{chat.name}</span>
                                                <span className="chat-time">{chat.time}</span>
                                            </div>
                                            <p className="chat-last-message">{chat.lastMessage}</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-chats">
                                    <div className="no-chats-icon">💬</div>
                                    <h3>У вас пока нет чатов</h3>
                                    <p>Начните общение, написав кому-нибудь!</p>
                                    <button 
                                        className="start-chat-btn"
                                        onClick={handleNewChat}
                                    >
                                        Начать первый чат
                                    </button>
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
                                <ul><Link to="/frinds">Друзья</Link></ul>
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
    )
}

export default Messenger;