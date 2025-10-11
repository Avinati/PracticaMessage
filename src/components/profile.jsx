import React, { useState, useEffect } from "react";
import Logo from '/public/Лого.png';
import Fav from '/public/Fav.png';
import Pfp from '/public/pfp.png';
import './css/Profile.css';
import { Link } from 'react-router-dom';    

function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Пользователь не авторизован');
            }

            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки профиля');
            }

            const data = await response.json();
            setUser(data.user);
        } catch (err) {
            setError(err.message);
            console.error('Ошибка загрузки профиля:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading">Загрузка профиля...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="main-content">
                <div className="error">Ошибка: {error}</div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="main-content">
                <div className="error">Пользователь не найден</div>
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
                        <Link to="/profile">
                            <button className="pfp-btn">
                                <img src={Pfp} alt="Профиль" />
                            </button>
                        </Link>
                    </div>
                </div>
                
                <div className="main-profile">
                    {/* Обновленный profile-hero с фоном */}
                    <div 
                        className="profile-hero"
                        style={{
                            backgroundImage: user.cover_url ? `url(${user.cover_url})` : 'none',
                            backgroundColor: user.cover_url ? 'transparent' : '#A7C957',
                            backgroundSize: 'cover',
                            backgroundPosition: 'center',
                            backgroundRepeat: 'no-repeat',
                            position: 'relative'
                        }}
                    >
                        {/* Затемнение для лучшей читаемости текста поверх фона */}
                        <div className="profile-hero-overlay"></div>
                        
                        <div className="user-galaxy">
                            <img 
                                className="avatar-cosmic" 
                                src={user.avatar_url || "./Аватарка.png"} 
                                alt="Аватар" 
                                onError={(e) => {
                                    e.target.src = "./Аватарка.png";
                                }}
                            />
                            <div className="user-stardust">
                                <h3>{user.name} {user.surname}</h3>
                                <p>@{user.nick || user.email.split('@')[0]}</p>
                                <p className="user-status">
                                    {user.is_online ? 'Online' : `Был(а) ${formatLastSeen(user.last_seen)}`}
                                </p>
                            </div>
                        </div>
                        <div className="profile-info">
                            <div className="orbit-actions">
                                <Link to='/settings'>
                                    <button className="quantum-settings">
                                        <img className="settings-portal" src="./Настройки.png" alt="Настройки" />
                                    </button>
                                </Link>
                                <Link to='/upload'>
                                    <button className="nebula-chat">
                                        <img className="chat-wormhole" src="./chat1.png" alt="Чат" />
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="cosmic-grid">
                        <div className="timeline-constellation">
                            <div className="timeline-header">
                                <h2>Лента</h2> 
                            </div>
                            
                            <div className="timeline-content">
                                <div className="post-header">
                                    <div className="post-identity">
                                        <img 
                                            className="avatar-nova" 
                                            src={user.avatar_url || "./Аватарка.png"} 
                                            alt="Аватар"
                                            onError={(e) => {
                                                e.target.src = "./Аватарка.png";
                                            }}
                                        />
                                        <h2 className="username-pulsar">@{user.nick || user.email.split('@')[0]}</h2>
                                        <img className="star-favorite" src="./favpost1.png" alt="Избранное" />
                                    </div>
                                </div>
                                <div className="post-universe">
                                    <img className="post-supernova" src="./haha.png" alt="Пост" />
                                </div>
                                <div className="post-actions">
                                    <img className="action-meteor" src="./like.png" alt="Лайк" />
                                    <img className="action-meteor" src="./comm.png" alt="Комментарий" />
                                    <img className="action-meteor" src="./share.png" alt="Поделиться" />
                                </div>
                            </div>
                        </div>

                        <div className="allies-constellation">
                            <div className="allies-header">
                                <h2>Союзники</h2> 
                            </div>

                            <div className="allies-content">
                                <div className="allies-cluster">
                                    <div className="ally-comet">
                                        <img 
                                            className="avatar-satellite" 
                                            src={user.avatar_url || "./Аватарка.png"} 
                                            alt="Аватар союзника"
                                            onError={(e) => {
                                                e.target.src = "./Аватарка.png";
                                            }}
                                        />
                                        <div className="ally-info">
                                            <h3>@{user.nick || user.email.split('@')[0]}</h3>
                                            <p>{user.is_online ? 'Online' : `Был(а) ${formatLastSeen(user.last_seen)}`}</p>
                                        </div>
                                        <button className="message-stargate">
                                            <img className="comet-message" src="./chat1.png" alt="Написать" />
                                        </button>
                                    </div>
                                </div>
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
                                <ul>Главная</ul>
                                <ul>Избранное</ul>
                                <ul>Профиль</ul>
                                <ul>Союзники</ul>
                                <ul>Настройки</ul>
                                <ul>Чаты</ul>
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

function formatLastSeen(lastSeen) {
    if (!lastSeen) return 'недавно';
    
    const now = new Date();
    const lastSeenDate = new Date(lastSeen);
    const diffInMinutes = Math.floor((now - lastSeenDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'только что';
    if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} дн назад`;
}

export default Profile;