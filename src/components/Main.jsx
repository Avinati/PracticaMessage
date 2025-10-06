import React from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import ForYou from '/public/personred.png'
import Friends from '/public/friends.png'
import Chat from '/public/chat.png'
import Set from '/public/settings.png'
import Like from '/public/like.png'
import Comm from '/public/comm.png'
import Share from '/public/share.png'
import './css/Main.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from "../App";

function Main() {
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
                <Link to="/login">
                <button className="pfp-btn">
                    <img src={Pfp} alt="Профиль" />
                </button>
                </Link>
                </div>
            </div>
            
            {/* Добавлен контейнер для меню и ленты новостей */}
            <div className="content-wrapper">
                <div className="menu">
                    <Link to="/" className="menu-link">
                        <button className="foryou-btn">
                            <img src={ForYou} alt="Для вас" />
                        </button>
                        <p className="text1">Для вас</p>
                    </Link>
                    <Link to="/frinds" className="menu-link">
                        <button className="frinds-btn">
                            <img src={Friends} alt="Друзья" />
                        </button>
                        <p className="text">Друзья</p>
                    </Link>
                    <Link to="/messanger" className="menu-link">
                        <button className="chat-btn">
                            <img src={Chat} alt="Чаты" />
                        </button>
                        <p className="text">Чаты</p>
                    </Link>
                    <Link to="/settings" className="menu-link">
                        <button className="set-btn">
                            <img src={Set} alt="Настройки" />
                        </button>
                        <p className="text">Настройки</p>
                    </Link>
                </div>
                <div className="news-feed">
                    <div className="news-items">
                        <div className="news-item">
                            <Link>
                            <div className="news-author">
                                <img src={Pfp} alt="Автор" className="author-avatar" />
                                <span className="author-name">Иван Иванов</span>
                            </div>
                            <div className="news-content">
                                <p>Сегодня был прекрасный день! Поделился новыми фотографиями из путешествия.</p>
                                <div className="news-image">
                                    {/* Здесь может быть изображение */}
                                </div>
                            </div>
                            <div className="news-actions">
                                <button className="like-btn">
                                    <img src={Like} alt="лайу" />
                                </button>
                                <button className="comment-btn">
                                    <img src={Comm} alt="Комментарии" />
                                </button>
                                <button className="share-btn">
                                    <img src={Share} alt="Поделиться" />
                                </button>
                            </div>
                            </Link>
                        </div>

                        <div className="news-item">
                            <div className="news-author">
                                <img src={Pfp} alt="Автор" className="author-avatar" />
                                <span className="author-name">Мария Петрова</span>
                            </div>
                            <div className="news-content">
                                <p>Только что закончила новый проект! Очень довольна результатом. 🎉</p>
                            </div>
                            <div className="news-actions">
                                <button className="like-btn">
                                    <img src={Like} alt="лайу" />
                                </button>
                                <button className="comment-btn">
                                    <img src={Comm} alt="Комментарии" />
                                </button>
                                <button className="share-btn">
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
                                <button className="like-btn">
                                    <img src={Like} alt="лайу" />
                                </button>
                                <button className="comment-btn">
                                    <img src={Comm} alt="Комментарии" />
                                </button>
                                <button className="share-btn">
                                    <img src={Share} alt="Поделиться" />
                                </button>
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
export default Main;