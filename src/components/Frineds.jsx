import React, { useState, useEffect } from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import ForYou from '/public/person.png'
import Friends from '/public/friendsred.png'
import Chat from '/public/chat.png'
import Set from '/public/settings.png'
import Yes from '/public/yes.png'
import No from '/public/no.png'
import Bin from '/public/bin.png'
import './css/Frineds.css'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'

function Main() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Статические данные друзей
    const friendsData = [
        { id: 1, name: "Анна Иванова", status: "online", avatar: "АИ" },
        { id: 2, name: "Петр Сидоров", status: "offline", avatar: "ПС" },
        { id: 3, name: "Мария Петрова", status: "online", avatar: "МП" },
        { id: 4, name: "Иван Козлов", status: "online", avatar: "ИК" },
        { id: 5, name: "Елена Смирнова", status: "offline", avatar: "ЕС" },
        { id: 6, name: "Дмитрий Волков", status: "online", avatar: "ДВ" },
    ];

    // Статические данные запросов в друзья
    const friendRequests = [
        { id: 1, name: "Сергей Новиков", mutualFriends: 3, avatar: "СН" },
        { id: 2, name: "Ольга Ковалева", mutualFriends: 7, avatar: "ОК" },
        { id: 3, name: "Алексей Морозов", mutualFriends: 1, avatar: "АМ" },
    ];

    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            setLoading(false);
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
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setLoading(false);
        }
    };

    const handleProtectedAction = (actionName) => {
        if (!isAuthenticated) {
            alert(`Войдите в аккаунт чтобы ${actionName}`);
            return false;
        }
        return true;
    };

    const handleRemoveFriend = (friendId, friendName) => {
        if (!handleProtectedAction('удалить друга')) return;
        
        if (window.confirm(`Вы уверены, что хотите удалить ${friendName} из друзей?`)) {
            // Здесь будет логика удаления друга
            console.log(`Удаляем друга с ID: ${friendId}`);
            alert(`${friendName} удален из друзей`);
        }
    };

    const handleAcceptRequest = (requestId, requestName) => {
        if (!handleProtectedAction('принять запрос в друзья')) return;
        
        // Здесь будет логика принятия запроса
        console.log(`Принимаем запрос с ID: ${requestId}`);
        alert(`Запрос от ${requestName} принят`);
    };

    const handleDeclineRequest = (requestId, requestName) => {
        if (!handleProtectedAction('отклонить запрос в друзья')) return;
        
        // Здесь будет логика отклонения запроса
        console.log(`Отклоняем запрос с ID: ${requestId}`);
        alert(`Запрос от ${requestName} отклонен`);
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading">Загрузка...</div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="main-content">
                <div className="auth-required">
                    <div className="auth-message">
                        <h2>Друзья доступны только авторизованным пользователям</h2>
                        <p>Войдите в аккаунт чтобы увидеть своих друзей и управлять запросами</p>
                        <div className="auth-buttons">
                            <Link to="/login">
                                <button className="login-btn">Войти</button>
                            </Link>
                            <Link to="/">
                                <button className="home-btn">На главную</button>
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
                        <p className="text1">Друзья</p>
                    </Link>
                    
                    {isAuthenticated ? (
                        <Link to="/messanger" className="menu-link">
                            <button className="chat-btn">
                                <img src={Chat} alt="Чаты" />
                            </button>
                            <p className="text">Чаты</p>
                        </Link>
                    ) : (
                        <div className="menu-link" onClick={() => alert('Войдите в аккаунт чтобы открыть чаты')}>
                            <button className="chat-btn">
                                <img src={Chat} alt="Чаты" />
                            </button>
                            <p className="text">Чаты</p>
                        </div>
                    )}
                    
                    {isAuthenticated ? (
                        <Link to="/settings" className="menu-link">
                            <button className="set-btn">
                                <img src={Set} alt="Настройки" />
                            </button>
                            <p className="text">Настройки</p>
                        </Link>
                    ) : (
                        <div className="menu-link" onClick={() => alert('Войдите в аккаунт чтобы открыть настройки')}>
                            <button className="set-btn">
                                <img src={Set} alt="Настройки" />
                            </button>
                            <p className="text">Настройки</p>
                        </div>
                    )}
                </div>

                <div className="friends-content">
                   

                    <div className="friends-section">
                        <div className="section-header">
                            <h2 className="section-title">Друзья</h2>
                            <span className="friends-count">{friendsData.length} друзей</span>
                        </div>
                        <div className="friends-list">
                            {friendsData.map(friend => (
                                <div key={friend.id} className="friend-card">
                                    <div className="friend-avatar-container">
                                        <div className="friend-avatar">
                                            {friend.avatar}
                                        </div>
                                        <div className={`status-dot ${friend.status}`}></div>
                                    </div>
                                    
                                    <div className="friend-info">
                                        <h3 className="friend-name">{friend.name}</h3>
                                        <span className="friend-status">
                                            {friend.status === 'online' ? 'В сети' : 'Не в сети'}
                                        </span>
                                    </div>
                                    
                                    <div className="friend-actions">
                                        <button 
                                            className="action-btn remove-btn"
                                            onClick={() => handleRemoveFriend(friend.id, friend.name)}
                                        >
                                            <img src={Bin} alt="Удалить" width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="requests-section">
                        <div className="section-header">
                            <h2 className="section-title">Запросы в друзья</h2>
                            <span className="requests-count">{friendRequests.length} запросов</span>
                        </div>
                        <div className="requests-list">
                            {friendRequests.map(request => (
                                <div key={request.id} className="request-card">
                                    <div className="request-avatar-container">
                                        <div className="request-avatar">
                                            {request.avatar}
                                        </div>
                                    </div>
                                    
                                    <div className="request-info">
                                        <h3 className="request-name">{request.name}</h3>
                                        <span className="mutual-friends">
                                            {request.mutualFriends} общих друзей
                                        </span>
                                    </div>
                                    
                                    <div className="request-actions">
                                        <button 
                                            className="action-btn accept-btn"
                                            onClick={() => handleAcceptRequest(request.id, request.name)}
                                        >
                                            <img src={Yes} alt="Принять" width="16" height="16" />
                                        </button>
                                        <button 
                                            className="action-btn decline-btn"
                                            onClick={() => handleDeclineRequest(request.id, request.name)}
                                        >
                                            <img src={No} alt="Отклонить" width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Секция поиска друзей */}
                    <div className="find-friends-section">
                        <div className="section-header">
                            <h2 className="section-title">Найти друзей</h2>
                        </div>
                        <div className="search-friends">
                            <input 
                                type="text" 
                                className="search-friends-input" 
                                placeholder="Поиск по имени или email..." 
                            />
                            <button className="search-friends-btn">
                                Поиск
                            </button>
                        </div>
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
                            <ul>
                                {isAuthenticated ? (
                                    <Link to="/profile">Профиль</Link>
                                ) : (
                                    <span onClick={() => alert('Войдите в аккаунт')}>Профиль</span>
                                )}
                            </ul>
                            <ul><Link to="/frinds">Друзья</Link></ul>
                            <ul>
                                {isAuthenticated ? (
                                    <Link to="/settings">Настройки</Link>
                                ) : (
                                    <span onClick={() => alert('Войдите в аккаунт')}>Настройки</span>
                                )}
                            </ul>
                            <ul>
                                {isAuthenticated ? (
                                    <Link to="/messanger">Чаты</Link>
                                ) : (
                                    <span onClick={() => alert('Войдите в аккаунт')}>Чаты</span>
                                )}
                            </ul>
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

export default Main;