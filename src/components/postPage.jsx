import React from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import './css/favorite.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Like from '/public/like.png'
import Comm from '/public/comm.png'
import Share from '/public/share.png'
import FavPost from '/public/favpost1.png'

function PostPage() {
    // Данные постов
    const postsData = [
        {
            id: 1,
            username: "@creative_soul",
            content: "Это потрясающий пост о творчестве и вдохновении! 🎨",
            likes: 127,
            comments: 24,
            shares: 8
        },
        {
            id: 2,
            username: "@tech_guru",
            content: "Новые технологии меняют наш мир каждый день. Что думаете о будущем AI?",
            likes: 89,
            comments: 42,
            shares: 15
        },
        {
            id: 3,
            username: "@travel_lover",
            content: "Невероятные пейзажи из моего последнего путешествия! 🌄",
            likes: 256,
            comments: 31,
            shares: 12
        },
        {
            id: 4,
            username: "@foodie_blogger",
            content: "Рецепт дня: домашняя паста с трюфельным соусом 🍝",
            likes: 178,
            comments: 28,
            shares: 7
        },
        {
            id: 5,
            username: "@fitness_coach",
            content: "Утренняя тренировка - залог продуктивного дня! 💪",
            likes: 94,
            comments: 19,
            shares: 5
        }
    ];

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
                    {/* Отображение постов */}
                    <div className="posts-container">
                        <div className="posts-grid">
                            {postsData.map((post) => (
                                <div className="post-card" key={post.id}>
                                    {/* Заголовок поста с аватаркой и никнеймом */}
                                    <div className="post-header">
                                        <div className="user-info">
                                            <img src={Pfp} alt="Аватар пользователя" className="user-avatar" />
                                            <span className="username">{post.username}</span>
                                        </div>
                                        <div className="post-date">
                                            <img src={FavPost} alt="В избранном" className="favpost-icon" />
                                        </div>
                                    </div>
                                    
                                    {/* Контент поста */}
                                    <div className="post-content">
                                        <p>{post.content}</p>
                                        
                                        {/* Изображение поста */}
                                        <div className="post-image-container">
                                            <div className="post-image">
                                                <div className="placeholder-image">
                                                    Изображение поста #{post.id}
                                                </div>
                                            </div>
                                        </div>
                                    
                                        {/* Панель действий */}
                                        <div className="post-actions">
                                            <button className="action-btn like-btn">
                                                <img src={Like} alt="Лайк" className="action-icon" />
                                                <span className="action-count">{post.likes}</span>
                                            </button>
                                            <button className="action-btn comment-btn">
                                                <img src={Comm} alt="Комментарии" className="action-icon" />
                                                <span className="action-count">{post.comments}</span>
                                            </button>
                                            <button className="action-btn share-btn">
                                                <img src={Share} alt="Поделиться" className="action-icon" />
                                                <span className="action-count">{post.shares}</span>
                                            </button>
                                        </div>
                                    </div>

                                    
                                    
                                    {/* Комментарии */}
                                    <div className="post-comments">
                                        <div className="comment">
                                            <img src={Pfp} alt="Аватар" className="comment-avatar" />
                                            <div className="comment-content">
                                                <span className="comment-author">@commenter_{post.id}</span>
                                                <p className="comment-text">Отличный пост! Очень вдохновляет!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
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
                                <ul>Друзья</ul>
                                <ul>Найстройки</ul>
                                <ul>Чаты</ul>
                            </div>
                            <div className="footer-column">
                                <li>Документация</li>
                                <ul>Условия пользователя</ul>
                                <ul>Условия использования</ul>
                                <ul>Политика куки</ul>
                                <ul>Политика конфидициации</ul>
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