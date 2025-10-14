import React, { useState, useEffect } from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import ForYou from '/public/personred.png'
import Friends from '/public/friends.png'
import Chat from '/public/chat.png'
import Set from '/public/settings.png'
import Like from '/public/like.png'
import Comm from '/public/comm.png'
import Liked from '/public/liked.png' 
import Share from '/public/share.png'
import './css/Main.css'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'

function Main() {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);
    const [postsLoading, setPostsLoading] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    // Загружаем посты когда пользователь авторизован
    useEffect(() => {
        if (isAuthenticated) {
            fetchPosts();
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

    const fetchPosts = async () => {
        if (!isAuthenticated) return;
        
        setPostsLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/posts/feed', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts || []);
            } else {
                console.error('Ошибка загрузки постов:', response.status);
            }
        } catch (error) {
            console.error('Ошибка загрузки постов:', error);
        } finally {
            setPostsLoading(false);
        }
    };

    const handleLike = async (postId, isCurrentlyLiked, e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы ставить лайки');
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/users/posts/${postId}/like`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                
                // Обновляем состояние поста
                setPosts(prevPosts => 
                    prevPosts.map(post => 
                        post.post_id === postId 
                            ? {
                                ...post,
                                likes_count: data.liked ? post.likes_count + 1 : post.likes_count - 1,
                                is_liked: data.liked
                            }
                            : post
                    )
                );
            } else {
                console.error('Ошибка лайка:', response.status);
            }
        } catch (error) {
            console.error('Ошибка лайка:', error);
        }
    };

    const handleProfileClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
        }
    };

    const formatPostTime = (createdAt) => {
        const now = new Date();
        const postDate = new Date(createdAt);
        const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'только что';
        if (diffInMinutes < 60) return `${diffInMinutes} мин назад`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours} ч назад`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) return `${diffInDays} дн назад`;
        
        return postDate.toLocaleDateString('ru-RU');
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading">Загрузка...</div>
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
                        <p className="text1">Для вас</p>
                    </Link>
                    
                    {/* Проверяем авторизацию для друзей */}
                    {isAuthenticated ? (
                        <Link to="/friends" className="menu-link">
                            <button className="friends-btn">
                                <img src={Friends} alt="Друзья" />
                            </button>
                            <p className="text">Друзья</p>
                        </Link>
                    ) : (
                        <div className="menu-link" onClick={() => alert('Войдите в аккаунт чтобы увидеть друзей')}>
                            <button className="friends-btn">
                                <img src={Friends} alt="Друзья" />
                            </button>
                            <p className="text">Друзья</p>
                        </div>
                    )}
                    
                    {/* Проверяем авторизацию для чатов */}
                    {isAuthenticated ? (
                        <Link to="/messenger" className="menu-link">
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
                    
                    {/* Проверяем авторизацию для настроек */}
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
                
                <div className="news-feed">
                    <div className="news-items">
                        {/* Приветственный пост для авторизованных пользователей */}
                        {isAuthenticated && posts.length === 0 && !postsLoading && (
                            <Link to = '/post/:postId'>
                            <div className="news-item welcome-post">
                                <div className="news-author">
                                    <img src={user?.avatar_url || Pfp} alt="Автор" className="author-avatar" />
                                    <span className="author-name">{user?.name || 'Пользователь'}</span>
                                </div>
                                <div className="news-content">
                                    <p>Добро пожаловать в вашу ленту! Здесь будут появляться новости от ваших друзей.</p>
                                    <p className="welcome-hint">Добавьте друзей чтобы видеть их посты!</p>
                                </div>
                            </div>
                            </Link>
                        )}

                        {/* Загрузка постов */}
                        {postsLoading && (
                            <div className="loading-posts">
                                <div className="loading-spinner"></div>
                                <p>Загрузка новостей...</p>
                            </div>
                        )}

                        {/* Реальные посты из БД */}
                        {posts.map((post) => (
                            <Link to={`/post/${post.post_id}`} key={post.post_id} className="post-link">
                                <div className="news-item">
                                    <div className="news-author">
                                        <img 
                                            src={post.avatar_url || Pfp} 
                                            alt="Автор" 
                                            className="author-avatar" 
                                        />
                                        <div className="author-info">
                                            <span className="author-name">
                                                {post.name} {post.surname}
                                            </span>
                                            <span className="post-time">
                                                {formatPostTime(post.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    
                                    {post.title && (
                                        <div className="post-title">
                                            <h3>{post.title}</h3>
                                        </div>
                                    )}
                                    
                                    <div className="news-content">
                                        <p>{post.content}</p>
                                        
                                        {post.image_url && (
                                            <div className="post-image">
                                                <img src={post.image_url} alt="Изображение поста" />
                                            </div>
                                        )}
                                        
                                        {post.video_url && (
                                            <div className="post-video">
                                                <video controls>
                                                    <source src={post.video_url} type="video/mp4" />
                                                    Ваш браузер не поддерживает видео.
                                                </video>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="post-stats">
                                        <span className="likes-count">{post.likes_count} лайков</span>
                                        <span className="comments-count">{post.comments_count} комментариев</span>
                                    </div>
                                    
                                    <div className="news-actions">
                                        <button 
                                            className={`like-btn ${post.is_liked ? 'liked' : ''}`}
                                            onClick={(e) => handleLike(post.post_id, post.is_liked, e)}
                                        >
                                            <img 
                                                src={post.is_liked ? Liked : Like} 
                                                alt={post.is_liked ? "Убрать лайк" : "Лайк"} 
                                            />
                                            <span>Лайк</span>
                                        </button>
                                        <button 
                                            className="comment-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                !isAuthenticated && alert('Войдите в аккаунт');
                                            }}
                                        >
                                            <img src={Comm} alt="Комментарии" />
                                            <span>Комментировать</span>
                                        </button>
                                        <button 
                                            className="share-btn"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                !isAuthenticated && alert('Войдите в аккаунт');
                                            }}
                                        >
                                            <img src={Share} alt="Поделиться" />
                                            <span>Поделиться</span>
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Демо посты для неавторизованных пользователей */}
                        {!isAuthenticated && (
                            <>
                                <div className="news-item">
                                    <div className="news-author">
                                        <img src={Pfp} alt="Автор" className="author-avatar" />
                                        <span className="author-name">Мария Петрова</span>
                                    </div>
                                    <div className="news-content">
                                        <p>Только что закончила новый проект! Очень довольна результатом. 🎉</p>
                                    </div>
                                    <div className="news-actions">
                                        <button className="like-btn" onClick={() => alert('Войдите в аккаунт')}>
                                            <img src={Like} alt="лайк" />
                                        </button>
                                        <button className="comment-btn" onClick={() => alert('Войдите в аккаунт')}>
                                            <img src={Comm} alt="Комментарии" />
                                        </button>
                                        <button className="share-btn" onClick={() => alert('Войдите в аккаунт')}>
                                            <img src={Share} alt="Поделиться" />
                                        </button>
                                    </div>
                                </div>

                                <div className="news-item">
                                    <div className="news-author">
                                        <img src={Pfp} alt="Автор" className="author-avatar" />
                                        <span className="author-name">Алексей Смирнов</span>
                                    </div>
                                    <div className="news-content">
                                        <p>Рекомендую к прочтению: "Искусство минимализма в современном дизайне". Очень вдохновляющая статья!</p>
                                    </div>
                                    <div className="news-actions">
                                        <button className="like-btn" onClick={() => alert('Войдите в аккаунт')}>
                                            <img src={Like} alt="лайк" />
                                        </button>
                                        <button className="comment-btn" onClick={() => alert('Войдите в аккаунт')}>
                                            <img src={Comm} alt="Комментарии" />
                                        </button>
                                        <button className="share-btn" onClick={() => alert('Войдите в аккаунт')}>
                                            <img src={Share} alt="Поделиться" />
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Призыв к входу если не авторизован */}
                        {!isAuthenticated && (
                            <div className="auth-promo">
                                <div className="auth-promo-content">
                                    <h3>Присоединяйтесь к сообществу!</h3>
                                    <p>Войдите в аккаунт чтобы увидеть больше контента и общаться с друзьями</p>
                                    <Link to="/login">
                                        <button className="auth-promo-btn">Войти</button>
                                    </Link>
                                </div>
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
                            <ul>
                                {isAuthenticated ? (
                                    <Link to="/friends">Друзья</Link>
                                ) : (
                                    <span onClick={() => alert('Войдите в аккаунт')}>Друзья</span>
                                )}
                            </ul>
                            <ul>
                                {isAuthenticated ? (
                                    <Link to="/settings">Настройки</Link>
                                ) : (
                                    <span onClick={() => alert('Войдите в аккаунт')}>Настройки</span>
                                )}
                            </ul>
                            <ul>
                                {isAuthenticated ? (
                                    <Link to="/messenger">Чаты</Link>
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