import React from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import ForYou from '/public/person.png'
import Friends from '/public/friends.png'
import Chat from '/public/chatred.png'
import Set from '/public/settings.png'
import Yes from '/public/yes.png'
import No from '/public/no.png'
import Bin from '/public/bin.png'
import './css/messanger.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from "../App";

function Main() {
    const chats = [
        { id: 1, name: "Алексей Петров", lastMessage: "Привет! Как дела?", unread: 2, online: true, time: "12:30" },
        { id: 2, name: "Мария Иванова", lastMessage: "Встречаемся завтра?", unread: 0, online: true, time: "11:45" },
        { id: 3, name: "Иван Сидоров", lastMessage: "Отправил файл", unread: 1, online: false, time: "10:20" },
        { id: 4, name: "Екатерина Белова", lastMessage: "Спасибо за помощь!", unread: 0, online: true, time: "09:15" },
        { id: 5, name: "Дмитрий Козлов", lastMessage: "Когда будет готово?", unread: 3, online: false, time: "08:30" }
    ];

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
                
                <div className="content-wrapper">
                    <div className="menu">
                        <Link to="/" className="menu-link">
                            <button className="foryou-btn">
                                <img src={ForYou} alt="Для вас" />
                            </button>
                            <p className="text">Для вас</p>
                        </Link>
                        <Link to="/friends" className="menu-link">
                            <button className="frinds-btn">
                                <img src={Friends} alt="Друзья" />
                            </button>
                            <p className="text">Друзья</p>
                        </Link>
                        <Link to="/messanger" className="menu-link">
                            <button className="chat-btn">
                                <img src={Chat} alt="Чаты" />
                            </button>
                            <p className="text1">Чаты</p>
                        </Link>
                        <Link to="/settings" className="menu-link">
                            <button className="set-btn">
                                <img src={Set} alt="Настройки" />
                            </button>
                            <p className="text">Настройки</p>
                        </Link>
                    </div>
                    
                    <div className="chats-container">
                        <div className="chats-list">
                            {chats.map(chat => (
                                <Link to="/chat" key={chat.id} className="chat-link">
                                    <div className="chat-item">
                                        {chat.unread > 0 && (
                                            <span className="unread-badge">{chat.unread}</span>
                                        )}
                                        <div className="chat-avatar">
                                            <img src={Pfp} alt="Аватар" />
                                            <span className={`online-status ${chat.online ? 'online' : 'offline'}`}></span>
                                        </div>
                                        <div className="chat-info">
                                            <div className="chat-header-info">
                                                <span className="chat-name">{chat.name}</span>
                                                <span className="chat-time">{chat.time}</span>
                                            </div>
                                            <p className="chat-last-message">{chat.lastMessage}</p>
                                        </div>
                                    </div>
                                </Link>
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
    )
}

export default Main;