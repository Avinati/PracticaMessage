import React, { useState, useEffect } from "react";
import { useParams, Link } from 'react-router-dom';
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import './css/postPage.css'
import Like from '/public/like.png'
import Comm from '/public/comm.png'
import Share from '/public/share.png'
import FavPost from '/public/favpost1.png'

function PostPage() {
    const { postId } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [comments, setComments] = useState([]);

    useEffect(() => {
        fetchPostData();
    }, [postId]);

    const fetchPostData = async () => {
        try {
            // Здесь будет реальный запрос к API для получения поста по ID
            // Пока используем mock данные
            const mockPost = {
                id: postId,
                username: "@creative_soul",
                userAvatar: Pfp,
                content: "Это потрясающий пост о творчестве и вдохновении! 🎨 Здесь я делюсь своим творческим процессом и тем, как нахожу вдохновение в повседневной жизни. Творчество - это не просто хобби, это образ мышления и способ восприятия мира вокруг нас.",
                likes: 127,
                comments: 24,
                shares: 8,
                title: "Мой творческий процесс и поиск вдохновения",
                date: "2 часа назад",
                image: null
            };

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
                },
                {
                    id: 3,
                    username: "@creative_mind",
                    avatar: Pfp,
                    text: "А где вы обычно ищете вдохновение? Мне всегда интересно узнавать о разных подходах.",
                    time: "30 минут назад",
                    likes: 2
                }
            ];

            setPost(mockPost);
            setComments(mockComments);
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLike = () => {
        if (post) {
            setPost(prev => ({
                ...prev,
                likes: prev.likes + 1
            }));
        }
    };

    const handleComment = () => {
        // Логика добавления комментария
        alert('Функция комментариев будет реализована позже');
    };

    const handleShare = () => {
        // Логика поделиться
        alert('Функция "Поделиться" будет реализована позже');
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
                                        <img src={post.userAvatar} alt="Аватар пользователя" className="user-avatar" />
                                        <div className="user-details">
                                            <span className="username">{post.username}</span>
                                            <span className="post-date">{post.date}</span>
                                        </div>
                                    </div>
                                    <div className="post-actions-top">
                                        <button className="save-btn">
                                            <img src={FavPost} alt="В избранное" className="favpost-icon" />
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
                                    {post.image && (
                                        <div className="post-image-container">
                                            <div className="post-image-detailed">
                                                <img src={post.image} alt="Изображение поста" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            
                                {/* Статистика поста */}
                                <div className="post-stats-detailed">
                                    <div className="stat-item">
                                        <span className="stat-count">{post.likes}</span>
                                        <span className="stat-label">лайков</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-count">{post.comments}</span>
                                        <span className="stat-label">комментариев</span>
                                    </div>
                                    <div className="stat-item">
                                        <span className="stat-count">{post.shares}</span>
                                        <span className="stat-label">поделились</span>
                                    </div>
                                </div>

                                {/* Панель действий */}
                                <div className="post-actions-detailed">
                                    <button className="action-btn like-btn" onClick={handleLike}>
                                        <img src={Like} alt="Лайк" className="action-icon" />
                                        <span className="action-text">Нравится</span>
                                    </button>
                                    <button className="action-btn comment-btn" onClick={handleComment}>
                                        <img src={Comm} alt="Комментарии" className="action-icon" />
                                        <span className="action-text">Комментировать</span>
                                    </button>
                                    <button className="action-btn share-btn" onClick={handleShare}>
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