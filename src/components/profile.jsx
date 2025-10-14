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
    const [favoritePosts, setFavoritePosts] = useState([]);
    const [friends, setFriends] = useState([]);
    const [postsLoading, setPostsLoading] = useState(true);
    const [friendsLoading, setFriendsLoading] = useState(true);

    useEffect(() => {
        fetchUserProfile();
    }, []);

    useEffect(() => {
        if (user) {
            fetchFavoritePosts();
            fetchFriends();
        }
    }, [user]);

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

    const fetchFavoritePosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/favorites/posts', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки избранных постов');
            }

            const data = await response.json();
            setFavoritePosts(data.favorites || []);
        } catch (err) {
            console.error('Ошибка загрузки избранных постов:', err);
            setFavoritePosts([]);
        } finally {
            setPostsLoading(false);
        }
    };

    const fetchFriends = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/friends', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки друзей');
            }

            const data = await response.json();
            setFriends(data.friends || []);
        } catch (err) {
            console.error('Ошибка загрузки друзей:', err);
            setFriends([]);
        } finally {
            setFriendsLoading(false);
        }
    };

    const handleRemoveFavorite = async (postId) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/posts/${postId}/favorite`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Удаляем пост из локального состояния
                setFavoritePosts(prev => prev.filter(post => post.post_id !== postId));
            }
        } catch (err) {
            console.error('Ошибка удаления из избранного:', err);
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
                        <div className="profile-hero-overlay"></div>
                        
                        <div className="profile-hero-content">
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
                                    <div className="profile-stats">
                                        <span>{friends.length} друзей</span>
                                        <span>{favoritePosts.length} избранных постов</span>
                                    </div>
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
                    </div>

                    <div className="cosmic-grid">
                        <div className="timeline-constellation">
                            <div className="timeline-header">
                                <h2>Посты</h2> 
                            </div>
                            
                            <div className="timeline-content">
                                {postsLoading ? (
                                    <div className="loading-posts">Загрузка избранных постов...</div>
                                ) : favoritePosts.length === 0 ? (
                                    <div className="no-posts">
                                        <p>У вас пока нет избранных постов</p>
                                        <Link to="/">
                                            <button className="discover-posts-btn">
                                                Найти интересные посты
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    favoritePosts.map(post => (
                                        <div key={post.post_id} className="favorite-post">
                                            <div className="post-header">
                                                <div className="post-identity">
                                                    <img 
                                                        className="avatar-nova" 
                                                        src={post.avatar_url || "./Аватарка.png"} 
                                                        alt="Аватар"
                                                        onError={(e) => {
                                                            e.target.src = "./Аватарка.png";
                                                        }}
                                                    />
                                                    <h2 className="username-pulsar">@{post.nick || 'пользователь'}</h2>
                                                    <button 
                                                        className="remove-favorite-btn"
                                                        onClick={() => handleRemoveFavorite(post.post_id)}
                                                        title="Удалить из избранного"
                                                    >
                                                        ❌
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="post-content">
                                                {post.title && <h3 className="post-title">{post.title}</h3>}
                                                <p className="post-text">{post.content}</p>
                                                {post.image_url && (
                                                    <div className="post-universe">
                                                        <img className="post-supernova" src={post.image_url} alt="Пост" />
                                                    </div>
                                                )}
                                                {post.video_url && (
                                                    <div className="post-video">
                                                        <video controls className="post-supernova">
                                                            <source src={post.video_url} type="video/mp4" />
                                                        </video>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="post-stats">
                                                <span className="post-likes">❤️ {post.likes_count || 0}</span>
                                                <span className="post-comments">💬 {post.comments_count || 0}</span>
                                                <span className="post-date">
                                                    {formatPostDate(post.favorited_at || post.created_at)}
                                                </span>
                                            </div>
                                            <div className="post-actions">
                                                <img className="action-meteor" src="./like.png" alt="Лайк" />
                                                <img className="action-meteor" src="./comm.png" alt="Комментарий" />
                                                <img className="action-meteor" src="./share.png" alt="Поделиться" />
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="allies-constellation">
                            <div className="allies-header">
                                <h2>Друзья</h2> 
                                <span className="friends-count">({friends.length})</span>
                            </div>

                            <div className="allies-content">
                                {friendsLoading ? (
                                    <div className="loading-friends">Загрузка друзей...</div>
                                ) : friends.length === 0 ? (
                                    <div className="no-friends">
                                        <p>У вас пока нет друзей</p>
                                        <Link to="/search">
                                            <button className="find-friends-btn">
                                                Найти друзей
                                            </button>
                                        </Link>
                                    </div>
                                ) : (
                                    <div className="allies-cluster">
                                        {friends.map(friend => (
                                            <div key={friend.user_id} className="ally-comet">
                                                <img 
                                                    className="avatar-satellite" 
                                                    src={friend.avatar_url || "./Аватарка.png"} 
                                                    alt="Аватар союзника"
                                                    onError={(e) => {
                                                        e.target.src = "./Аватарка.png";
                                                    }}
                                                />
                                                <div className="ally-info">
                                                    <h3>{friend.name} {friend.surname}</h3>
                                                    <p>@{friend.nick || friend.email?.split('@')[0]}</p>
                                                    <p className="friend-status">
                                                        {friend.is_online ? 'Online' : `Был(а) ${formatLastSeen(friend.last_seen)}`}
                                                    </p>
                                                </div>
                                                <button className="message-stargate">
                                                    <img className="comet-message" src="./chat1.png" alt="Написать" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
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

function formatPostDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'только что';
    if (diffInHours < 24) return `${diffInHours} ч назад`;
    
    return date.toLocaleDateString('ru-RU');
}

export default Profile;