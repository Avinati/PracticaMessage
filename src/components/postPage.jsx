import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import './css/postPage.css'
import Like from '/public/like.png'
import Comm from '/public/comm.png'
import Share from '/public/share.png'
import FavPost from '/public/favpost1.png'
import FavPostFilled from '/public/favpost.png'
import Liked from '/public/liked.png'

function PostPage() {
    const { postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        checkAuthentication();
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPostData();
            checkIfFavorite();
        }
    }, [postId, isAuthenticated]);

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
            } else {
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error('Auth check error:', error);
            setIsAuthenticated(false);
        }
    };

    const fetchPostData = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }

            const response = await fetch(`http://localhost:5000/api/users/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPost(data.post);
                
                // Загружаем комментарии для этого поста
                fetchComments(data.post.post_id);
            } else {
                console.error('Ошибка загрузки поста:', response.status);
                setPost(null);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            setPost(null);
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async (postId) => {
        try {
            // Здесь будет запрос к API для получения комментариев
            // Пока используем mock данные
            const mockComments = [
                {
                    id: 1,
                    username: "@art_lover",
                    avatar: Pfp,
                    text: "Очень вдохновляющий пост! Спасибо, что делитесь своим опытом!",
                    time: "1 час назад",
                    likes: 5
                },
                {
                    id: 2,
                    username: "@designer_pro",
                    avatar: Pfp,
                    text: "Полностью согласен! Творчество действительно меняет восприятие мира.",
                    time: "45 минут назад",
                    likes: 3
                }
            ];
            setComments(mockComments);
        } catch (error) {
            console.error('Error fetching comments:', error);
        }
    };

    const checkIfFavorite = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch(`http://localhost:5000/api/users/posts/${postId}/favorite/check`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setIsFavorite(data.isFavorite);
            }
        } catch (error) {
            console.error('Error checking favorite:', error);
        }
    };

    const handleFavorite = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert('Войдите в систему, чтобы добавлять посты в избранное');
                return;
            }

            let response;
            
            if (isFavorite) {
                response = await fetch(`http://localhost:5000/api/users/posts/${postId}/favorite`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                response = await fetch(`http://localhost:5000/api/users/posts/${postId}/favorite`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            }

            if (response.ok) {
                setIsFavorite(!isFavorite);
            } else {
                const errorData = await response.json();
                alert(errorData.error || 'Произошла ошибка');
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            alert('Ошибка соединения с сервером');
        }
    };

    const handleLike = async () => {
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
                setPost(prev => ({
                    ...prev,
                    likes_count: data.liked ? prev.likes_count + 1 : prev.likes_count - 1,
                    is_liked: data.liked
                }));
            } else {
                console.error('Ошибка лайка:', response.status);
            }
        } catch (error) {
            console.error('Ошибка лайка:', error);
        }
    };

    const handleComment = () => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы комментировать');
            return;
        }
        // Логика добавления комментария
        alert('Функция комментариев будет реализована позже');
    };

    const handleShare = () => {
        // Логика поделиться
        alert('Функция "Поделиться" будет реализована позже');
    };

    const formatPostTime = (createdAt) => {
        if (!createdAt) return '';
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
                <div className="loading">Загрузка поста...</div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="main-content">
                <div className="error">Пост не найден</div>
                <Link to="/" className="back-button">Вернуться на главную</Link>
            </div>
        );
    }

    return (
        <>
            <div className="main-content">
                {/* Фиксированный хедер */}
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
                
                {/* Основной контент страницы поста */}
                <div className="favorite-content">
                    <div className="posts-container">
                        <div className="posts-grid">
                            <div className="post-card detailed-post">
                                {/* Кнопка назад */}
                                <div className="post-navigation">
                                    <Link to="/" className="back-button">
                                        ← Назад к ленте
                                    </Link>
                                </div>

                                {/* Заголовок поста с аватаркой и никнеймом */}
                                <div className="post-header">
                                    <div className="user-info">
                                        <img src={post.avatar_url || Pfp} alt="Аватар пользователя" className="user-avatar" />
                                        <div className="user-details">
                                            <span className="username">
                                                {post.name} {post.surname}
                                            </span>
                                            <span className="post-date">
                                                {formatPostTime(post.created_at)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="post-actions-top">
                                        <button 
                                            className={`save-btn ${isFavorite ? 'saved' : ''}`}
                                            onClick={handleFavorite}
                                        >
                                            <img 
                                                src={isFavorite ? FavPostFilled : FavPost} 
                                                alt={isFavorite ? "В избранном" : "В избранное"} 
                                                className="favpost-icon" 
                                            />
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Заголовок поста */}
                                {post.title && (
                                    <div className="post-title-detailed">
                                        <h1>{post.title}</h1>
                                    </div>
                                )}

                                {/* Контент поста */}
                                <div className="post-content-detailed">
                                    <p>{post.content}</p>
                                    
                                    {/* Изображение поста (если есть) */}
                                    {post.image_url && (
                                        <div className="post-image-container">
                                            <div className="post-image-detailed">
                                                <img src={post.image_url} alt="Изображение поста" />
                                            </div>
                                        </div>
                                    )}

                                    {/* Видео поста (если есть) */}
                                    {post.video_url && (
                                        <div className="post-video-detailed">
                                            <video controls>
                                                <source src={post.video_url} type="video/mp4" />
                                                Ваш браузер не поддерживает видео.
                                            </video>
                                        </div>
                                    )}
                                </div>
                            
                                {/* Статистика поста */}
                                <div className="post-stats-detailed">
                                    <div className="stat-item">
                                        <span className="stat-count">{post.likes_count || 0}</span>
                                        <span className="stat-label">лайков</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-count">{post.comments_count || 0}</span>
                                        <span className="stat-label">комментариев</span>
                                    </div>
                                </div>

                                {/* Панель действий */}
                                <div className="post-actions-detailed">
                                    <button 
                                        className={`action-btn like-btn ${post.is_liked ? 'liked' : ''}`}
                                        onClick={handleLike}
                                    >
                                        <img 
                                            src={post.is_liked ? Liked : Like} 
                                            alt="Лайк" 
                                            className="action-icon" 
                                        />
                                        <span className="action-text">
                                            {post.is_liked ? 'Не нравится' : 'Нравится'}
                                        </span>
                                    </button>
                                    <button 
                                        className="action-btn comment-btn" 
                                        onClick={handleComment}
                                    >
                                        <img src={Comm} alt="Комментарии" className="action-icon" />
                                        <span className="action-text">Комментировать</span>
                                    </button>
                                    <button 
                                        className="action-btn share-btn" 
                                        onClick={handleShare}
                                    >
                                        <img src={Share} alt="Поделиться" className="action-icon" />
                                        <span className="action-text">Поделиться</span>
                                    </button>
                                </div>

                                {/* Комментарии */}
                                <div className="post-comments-detailed">
                                    <h3 className="comments-title">Комментарии ({comments.length})</h3>
                                    
                                    {comments.map((comment) => (
                                        <div className="comment-detailed" key={comment.id}>
                                            <img src={comment.avatar} alt="Аватар" className="comment-avatar" />
                                            <div className="comment-content-detailed">
                                                <div className="comment-header">
                                                    <span className="comment-author">{comment.username}</span>
                                                    <span className="comment-time">{comment.time}</span>
                                                </div>
                                                <p className="comment-text">{comment.text}</p>
                                                <div className="comment-actions">
                                                    <button className="comment-like-btn">
                                                        <span>❤️ {comment.likes}</span>
                                                    </button>
                                                    <button className="comment-reply-btn">
                                                        <span>Ответить</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Поле для нового комментария */}
                                    {isAuthenticated && (
                                        <div className="new-comment">
                                            <img src={Pfp} alt="Ваш аватар" className="comment-avatar" />
                                            <div className="comment-input-container">
                                                <input 
                                                    type="text" 
                                                    className="comment-input" 
                                                    placeholder="Напишите комментарий..."
                                                />
                                                <button className="comment-submit-btn">Отправить</button>
                                            </div>
                                        </div>
                                    )}
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
    )
}

export default PostPage;