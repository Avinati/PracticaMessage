import React from "react";
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
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from "../App";

function Main() {
    // Статические данные друзей
    const friendsData = [
        { id: 1, name: "Анна Иванова", status: "online", avatar: "АИ" },
        { id: 2, name: "Петр Сидоров", status: "offline", avatar: "ПС" },
        { id: 3, name: "Мария Петрова", status: "online", avatar: "МП" },
        { id: 4, name: "Иван Козлов", status: "online", avatar: "ИК" },
        { id: 5, name: "Елена Смирнова", status: "offline", avatar: "ЕС" },
        { id: 6, name: "Дмитрий Волков", status: "online", avatar: "ДВ" },
    ];

    // Статические данные запросов в друзья
    const friendRequests = [
        { id: 1, name: "Сергей Новиков", mutualFriends: 3, avatar: "СН" },
        { id: 2, name: "Ольга Ковалева", mutualFriends: 7, avatar: "ОК" },
        { id: 3, name: "Алексей Морозов", mutualFriends: 1, avatar: "АМ" },
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
                <Link to="/profile">
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
                    <Link to="/frinds" className="menu-link">
                        <button className="frinds-btn">
                            <img src={Friends} alt="Друзья" />
                        </button>
                        <p className="text1">Друзья</p>
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

                <div className="friends-content">
                    <div className="friends-section">
                        <div className="section-header">
                            <h2 className="section-title">Друзья</h2>
                            <span className="friends-count">{friendsData.length} друзей</span>
                        </div>
                        <div className="friends-list">
                            {friendsData.map(friend => (
                                <div key={friend.id} className="friend-card">
                                    <div className="friend-avatar-container">
                                        <div className="friend-avatar">
                                            {friend.avatar}
                                        </div>
                                        <div className={`status-dot ${friend.status}`}></div>
                                    </div>
                                    
                                    <div className="friend-info">
                                        <h3 className="friend-name">{friend.name}</h3>
                                        <span className="friend-status">
                                            {friend.status === 'online' ? 'В сети' : 'Не в сети'}
                                        </span>
                                    </div>
                                    
                                    <div className="friend-actions">
                                        <button className="action-btn remove-btn">
                                            <img src={Bin} alt="Удалить" width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="requests-section">
                        <div className="section-header">
                            <h2 className="section-title">Запросы в друзья</h2>
                            <span className="requests-count">{friendRequests.length} запросов</span>
                        </div>
                        <div className="requests-list">
                            {friendRequests.map(request => (
                                <div key={request.id} className="request-card">
                                    <div className="request-avatar-container">
                                        <div className="request-avatar">
                                            {request.avatar}
                                        </div>
                                    </div>
                                    
                                    <div className="request-info">
                                        <h3 className="request-name">{request.name}</h3>
                                        <span className="mutual-friends">
                                            {request.mutualFriends} общих друзей
                                        </span>
                                    </div>
                                    
                                    <div className="request-actions">
                                        <button className="action-btn accept-btn">
                                            <img src={Yes} alt="Принять" width="16" height="16" />
                                        </button>
                                        <button className="action-btn decline-btn">
                                            <img src={No} alt="Отклонить" width="16" height="16" />
                                        </button>
                                    </div>
                                </div>
                            ))}
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