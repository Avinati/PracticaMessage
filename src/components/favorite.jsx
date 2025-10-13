import React, { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import './css/favorite.css'
import Like from '/public/like.png'
import Comm from '/public/comm.png'
import Share from '/public/share.png'
import FavPost from '/public/favpost.png'
import FavPostFilled from '/public/favpost.png'

function Favorite() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchFavoritePosts();
    }, []);

    const fetchFavoritePosts = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            if (!token) {
                setError('Пожалуйста, войдите в систему');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/users/favorites/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                setPosts(data.favorites || []);
                setError(null);
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Ошибка загрузки избранного');
            }
        } catch (error) {
            console.error('Error fetching favorites:', error);
            setError('Ошибка соединения с сервером');
            // Для демонстрации используем mock данные
            setPosts(getMockFavoritePosts());
        } finally {
            setLoading(false);
        }
    };

    const getMockFavoritePosts = () => {
        return [
            {
                post_id: 1,
                username: "@creative_soul",
                nick: "creative_soul",
                content: "Это потрясающий пост о творчестве и вдохновении! 🎨",
                likes_count: 127,
                comments_count: 24,
                shares: 8,
                title: "Мой творческий процесс",
                created_at: "2024-01-15T10:30:00Z",
                avatar_url: Pfp,
                is_liked: true,
                favorited_at: "2024-01-15T11:00:00Z"
            },
            {
                post_id: 2,
                username: "@tech_guru",
                nick: "tech_guru",
                content: "Новые технологии меняют наш мир каждый день. Что думаете о будущем AI?",
                likes_count: 89,
                comments_count: 42,
                shares: 15,
                title: "Будущее искусственного интеллекта",
                created_at: "2024-01-14T15:45:00Z",
                avatar_url: Pfp,
                is_liked: false,
                favorited_at: "2024-01-14T16:20:00Z"
            },
            {
                post_id: 3,
                username: "@travel_lover",
                nick: "travel_lover",
                content: "Невероятные пейзажи из моего последнего путешествия! 🌄",
                likes_count: 256,
                comments_count: 31,
                shares: 12,
                title: "Горные пейзажи",
                created_at: "2024-01-13T08:20:00Z",
                avatar_url: Pfp,
                is_liked: true,
                favorited_at: "2024-01-13T09:15:00Z"
            }
        ];
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
            setPosts(prevPosts => prevPosts.filter(post => post.post_id !== postId));
        } else {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Ошибка удаления из избранного');
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        alert(error.message);
    }
};

    const handleLike = async (postId) => {
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
                // Обновляем локальное состояние
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
            }
        } catch (error) {
            console.error('Error liking post:', error);
            // Fallback для демонстрации
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post.post_id === postId 
                        ? { 
                            ...post, 
                            likes_count: post.is_liked ? post.likes_count - 1 : post.likes_count + 1,
                            is_liked: !post.is_liked 
                        }
                        : post
                )
            );
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
        
        if (diffInHours < 1) {
            return 'только что';
        } else if (diffInHours < 24) {
            return `${diffInHours} часов назад`;
        } else {
            return `${Math.floor(diffInHours / 24)} дней назад`;
        }
    };

    const handleComment = (postId) => {
        alert(`Функция комментариев для поста ${postId} будет реализована позже`);
    };

    const handleShare = (postId) => {
        alert(`Функция "Поделиться" для поста ${postId} будет реализована позже`);
    };

    if (loading) {
        return (
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
                
                <div className="favorite-content">
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Загрузка избранных постов...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
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
                
                <div className="favorite-content">
                    <div className="error-container">
                        <div className="error-message">
                            <h3>Ошибка</h3>
                            <p>{error}</p>
                            <button onClick={fetchFavoritePosts} className="retry-btn">
                                Попробовать снова
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
                
                {/* Основной контент страницы избранного */}
                <div className="favorite-content">
                    {/* Заголовок страницы */}
                    <div className="favorite-header">
                        <h1>Избранные посты</h1>
                        <p className="favorite-subtitle">
                            {posts.length > 0 
                                ? `У вас ${posts.length} избранных ${posts.length === 1 ? 'пост' : posts.length < 5 ? 'поста' : 'постов'}`
                                : 'Здесь будут отображаться посты, добавленные в избранное'
                            }
                        </p>
                    </div>

                    {/* Отображение постов */}
                    <div className="posts-container">
                        {posts.length === 0 ? (
                            <div className="empty-favorites">
                                <div className="empty-icon">⭐</div>
                                <h3>Пока нет избранных постов</h3>
                                <p>Добавляйте посты в избранное, нажимая на иконку закладки</p>
                                <Link to="/" className="browse-posts-btn">
                                    Перейти к ленте
                                </Link>
                            </div>
                        ) : (
                            <div className="posts-grid">
                                {posts.map((post) => (
                                    <div className="post-card favorite-post" key={post.post_id}>
                                        {/* Заголовок поста с аватаркой и никнеймом */}
                                        <div className="post-header">
                                            <div className="user-info">
                                                <img 
                                                    src={post.avatar_url || Pfp} 
                                                    alt="Аватар пользователя" 
                                                    className="user-avatar" 
                                                />
                                                <div className="user-details">
                                                    <span className="username">@{post.nick || post.username}</span>
                                                    <span className="post-date">
                                                        Добавлено в избранное: {formatDate(post.favorited_at)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="post-actions-top">
                                                <button 
                                                    className="remove-favorite-btn"
                                                    onClick={() => handleRemoveFavorite(post.post_id)}
                                                    title="Удалить из избранного"
                                                >
                                                    <img 
                                                        src={FavPostFilled} 
                                                        alt="Удалить из избранного" 
                                                        className="favpost-icon filled" 
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        {/* Заголовок поста */}
                                        {post.title && (
                                            <div className="post-title">
                                                <h3>{post.title}</h3>
                                            </div>
                                        )}

                                        {/* Контент поста */}
                                        <div className="post-content">
                                            <p>{post.content}</p>
                                            
                                            {/* Изображение поста */}
                                            {post.image_url && (
                                                <div className="post-image-container">
                                                    <div className="post-image">
                                                        <img 
                                                            src={post.image_url} 
                                                            alt="Изображение поста" 
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        
                                            {/* Панель действий */}
                                            <div className="post-actions">
                                                <button 
                                                    className={`action-btn like-btn ${post.is_liked ? 'liked' : ''}`}
                                                    onClick={() => handleLike(post.post_id)}
                                                >
                                                    <img 
                                                        src={Like} 
                                                        alt="Лайк" 
                                                        className="action-icon" 
                                                    />
                                                    <span className="action-count">{post.likes_count}</span>
                                                </button>
                                                <button 
                                                    className="action-btn comment-btn"
                                                    onClick={() => handleComment(post.post_id)}
                                                >
                                                    <img 
                                                        src={Comm} 
                                                        alt="Комментарии" 
                                                        className="action-icon" 
                                                    />
                                                    <span className="action-count">{post.comments_count}</span>
                                                </button>
                                                <button 
                                                    className="action-btn share-btn"
                                                    onClick={() => handleShare(post.post_id)}
                                                >
                                                    <img 
                                                        src={Share} 
                                                        alt="Поделиться" 
                                                        className="action-icon" 
                                                    />
                                                    <span className="action-count">{post.shares || 0}</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Ссылка на полную версию поста */}
                                        <div className="post-footer">
                                            <Link 
                                                to={`/post/${post.post_id}`} 
                                                className="view-full-post"
                                            >
                                                Читать полностью →
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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

export default Favorite;