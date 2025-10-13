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
    
    // Состояния для данных
    const [friends, setFriends] = useState([]);
    const [friendRequests, setFriendRequests] = useState([]);
    const [searchResults, setSearchResults] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            loadFriendsData();
        }
    }, [isAuthenticated]);

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

    const handleLogout = async () => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
        try {
            const token = localStorage.getItem('token');
            
            // Вызываем endpoint выхода на сервере
            await fetch('http://localhost:5000/api/auth/logout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            // Очищаем локальное хранилище
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Сбрасываем состояние
            setIsAuthenticated(false);
            setUser(null);
            setFriends([]);
            setFriendRequests([]);
            setSearchResults([]);
            
            // Перенаправляем на главную страницу
            navigate('/');
            
            alert('Вы успешно вышли из аккаунта');
            
        } catch (error) {
            console.error('Logout error:', error);
            // В любом случае очищаем локальное хранилище
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            setUser(null);
            navigate('/');
        }
    }
};

    const loadFriendsData = async () => {
        try {
            const token = localStorage.getItem('token');
            
            // Загрузка списка друзей
            const friendsResponse = await fetch('http://localhost:5000/api/users/friends', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (friendsResponse.ok) {
                const friendsData = await friendsResponse.json();
                setFriends(friendsData.friends || []);
            }

            // Загрузка запросов в друзья
            const requestsResponse = await fetch('http://localhost:5000/api/users/friends/requests', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (requestsResponse.ok) {
                const requestsData = await requestsResponse.json();
                setFriendRequests(requestsData.requests || []);
            }
        } catch (error) {
            console.error('Error loading friends data:', error);
        }
    };

    const handleProtectedAction = (actionName) => {
        if (!isAuthenticated) {
            alert(`Войдите в аккаунт чтобы ${actionName}`);
            return false;
        }
        return true;
    };

    const handleRemoveFriend = async (friendId, friendName) => {
        if (!handleProtectedAction('удалить друга')) return;
        
        if (window.confirm(`Вы уверены, что хотите удалить ${friendName} из друзей?`)) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://localhost:5000/api/users/friends/remove', {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ friendId })
                });

                if (response.ok) {
                    setFriends(prev => prev.filter(friend => friend.user_id !== friendId));
                    alert(`${friendName} удален из друзей`);
                } else {
                    const error = await response.json();
                    alert(`Ошибка: ${error.error}`);
                }
            } catch (error) {
                console.error('Remove friend error:', error);
                alert('Ошибка при удалении друга');
            }
        }
    };

    const handleAcceptRequest = async (friendshipId, requestName) => {
        if (!handleProtectedAction('принять запрос в друзья')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/friends/accept', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friendshipId })
            });

            if (response.ok) {
                setFriendRequests(prev => prev.filter(req => req.friendship_id !== friendshipId));
                // Обновляем список друзей
                await loadFriendsData();
                alert(`Запрос от ${requestName} принят`);
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.error}`);
            }
        } catch (error) {
            console.error('Accept request error:', error);
            alert('Ошибка при принятии запроса');
        }
    };

    const handleDeclineRequest = async (friendshipId, requestName) => {
        if (!handleProtectedAction('отклонить запрос в друзья')) return;
        
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/friends/decline', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ friendshipId })
            });

            if (response.ok) {
                setFriendRequests(prev => prev.filter(req => req.friendship_id !== friendshipId));
                alert(`Запрос от ${requestName} отклонен`);
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.error}`);
            }
        } catch (error) {
            console.error('Decline request error:', error);
            alert('Ошибка при отклонении запроса');
        }
    };

    const handleSearchFriends = async (e) => {
        e.preventDefault();
        
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        if (!handleProtectedAction('искать друзей')) return;

        setIsSearching(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/search?query=${encodeURIComponent(searchQuery)}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSearchResults(data.users || []);
            } else {
                setSearchResults([]);
            }
        } catch (error) {
            console.error('Search error:', error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSendFriendRequest = async (targetUserId, targetUserName) => {
        if (!handleProtectedAction('отправить запрос в друзья')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/friends/request', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ targetUserId })
            });

            if (response.ok) {
                alert(`Запрос в друзья отправлен ${targetUserName}`);
                // Обновляем результаты поиска
                setSearchResults(prev => prev.filter(user => user.user_id !== targetUserId));
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.error}`);
            }
        } catch (error) {
            console.error('Send friend request error:', error);
            alert('Ошибка при отправке запроса в друзья');
        }
    };

    const getAvatarDisplay = (user) => {
        if (user.avatar_url) {
            return <img src={user.avatar_url} alt="Avatar" className="avatar-image" />;
        }
        return user.nick ? user.nick.substring(0, 2).toUpperCase() : 
               (user.name && user.surname) ? `${user.name[0]}${user.surname[0]}`.toUpperCase() : 'U';
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
    
    {/* Кнопка выхода - показываем только для авторизованных пользователей */}
    {isAuthenticated && (
        <button 
            className="logout-btn"
            onClick={handleLogout}
            title="Выйти"
        >
            <span>Выйти</span>
        </button>
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
                    {/* Секция поиска друзей */}
                    <div className="find-friends-section">
                        <div className="section-header">
                            <h2 className="section-title">Найти друзей</h2>
                        </div>
                        <div className="search-friends">
                            <form onSubmit={handleSearchFriends} className="search-form">
                                <input 
                                    type="text" 
                                    className="search-friends-input" 
                                    placeholder="Поиск по имени, фамилии или никнейму..." 
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="search-friends-btn" disabled={isSearching}>
                                    {isSearching ? 'Поиск...' : 'Поиск'}
                                </button>
                            </form>
                        </div>

                        {/* Результаты поиска */}
                        {searchResults.length > 0 && (
                            <div className="search-results">
                                <h3 className="search-results-title">Результаты поиска</h3>
                                <div className="search-results-list">
                                    {searchResults.map(user => (
                                        <div key={user.user_id} className="search-result-card">
                                            <div className="search-result-avatar">
                                                {getAvatarDisplay(user)}
                                            </div>
                                            <div className="search-result-info">
                                                <h4 className="search-result-name">
                                                    {user.name} {user.surname}
                                                    {user.nick && <span className="search-result-nick"> (@{user.nick})</span>}
                                                </h4>
                                                <span className="search-result-status">
                                                    {user.is_online ? 'В сети' : 'Не в сети'}
                                                </span>
                                            </div>
                                            <button 
                                                className="add-friend-btn"
                                                onClick={() => handleSendFriendRequest(user.user_id, `${user.name} ${user.surname}`)}
                                            >
                                                Добавить в друзья
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {searchQuery && searchResults.length === 0 && !isSearching && (
                            <div className="no-results">
                                <p>Пользователи не найдены</p>
                            </div>
                        )}
                    </div>

                    {/* Секция запросов в друзья */}
                    {friendRequests.length > 0 && (
                        <div className="requests-section">
                            <div className="section-header">
                                <h2 className="section-title">Запросы в друзья</h2>
                                <span className="requests-count">{friendRequests.length} запросов</span>
                            </div>
                            <div className="requests-list">
                                {friendRequests.map(request => (
                                    <div key={request.friendship_id} className="request-card">
                                        <div className="request-avatar-container">
                                            <div className="request-avatar">
                                                {getAvatarDisplay(request)}
                                            </div>
                                        </div>
                                        
                                        <div className="request-info">
                                            <h3 className="request-name">
                                                {request.name} {request.surname}
                                                {request.nick && <span className="request-nick"> (@{request.nick})</span>}
                                            </h3>
                                            <span className="mutual-friends">
                                                {request.mutual_friends || 0} общих друзей
                                            </span>
                                        </div>
                                        
                                        <div className="request-actions">
                                            <button 
                                                className="action-btn accept-btn"
                                                onClick={() => handleAcceptRequest(request.friendship_id, `${request.name} ${request.surname}`)}
                                            >
                                                <img src={Yes} alt="Принять" width="16" height="16" />
                                            </button>
                                            <button 
                                                className="action-btn decline-btn"
                                                onClick={() => handleDeclineRequest(request.friendship_id, `${request.name} ${request.surname}`)}
                                            >
                                                <img src={No} alt="Отклонить" width="16" height="16" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Секция списка друзей */}
                    <div className="friends-section">
                        <div className="section-header">
                            <h2 className="section-title">Друзья</h2>
                            <span className="friends-count">{friends.length} друзей</span>
                        </div>
                        {friends.length > 0 ? (
                            <div className="friends-list">
                                {friends.map(friend => (
                                    <div key={friend.user_id} className="friend-card">
                                        <div className="friend-avatar-container">
                                            <div className="friend-avatar">
                                                {getAvatarDisplay(friend)}
                                            </div>
                                            <div className={`status-dot ${friend.is_online ? 'online' : 'offline'}`}></div>
                                        </div>
                                        
                                        <div className="friend-info">
                                            <h3 className="friend-name">
                                                {friend.name} {friend.surname}
                                                {friend.nick && <span className="friend-nick"> (@{friend.nick})</span>}
                                            </h3>
                                            <span className="friend-status">
                                                {friend.is_online ? 'В сети' : `Был(а) в сети ${new Date(friend.last_seen).toLocaleDateString()}`}
                                            </span>
                                        </div>
                                        
                                        <div className="friend-actions">
                                            <button 
                                                className="action-btn remove-btn"
                                                onClick={() => handleRemoveFriend(friend.user_id, `${friend.name} ${friend.surname}`)}
                                            >
                                                <img src={Bin} alt="Удалить" width="16" height="16" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-friends">
                                <p>У вас пока нет друзей. Найдите новых друзей с помощью поиска!</p>
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