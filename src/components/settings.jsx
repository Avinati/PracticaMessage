import React from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import ForYou from '/public/person.png'
import Friends from '/public/friends.png'
import Chat from '/public/chat.png'
import Set from '/public/settingsred.png'
import './css/settings.css'
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
                        <p className="text">Для вас</p>
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
                        <p className="text1">Настройки</p>
                    </Link>
                </div>
                <div className="settings-container">
            {/* Обложка и аватар */}
            <div className="profile-header">
                <div className="cover-photo">
                    <div className="avatar-section">
                        <img src={Pfp} alt="Аватар" className="profile-avatar" />
                        <h2 className="username">@username</h2>
                        <div className="photo-buttons">
                            <button className="change-btn">Изменить аватар</button>
                            <button className="change-btn">Изменить обложку</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Форма настроек */}
            <div className="settings-form">
                <div className="setting-group">
                    <label htmlFor="displayName">Отображаемое имя</label>
                    <input 
                        type="text" 
                        id="displayName" 
                        className="setting-input"
                        placeholder="Введите ваше имя"
                        defaultValue="Иван Иванов"
                    />
                </div>

                <div className="setting-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        className="setting-input"
                        placeholder="Введите ваш email"
                        defaultValue="example@mail.com"
                    />
                </div>

                <div className="setting-group">
                    <label htmlFor="birthDate">Дата рождения</label>
                    <input 
                        type="date" 
                        id="birthDate" 
                        className="setting-input"
                    />
                </div>

                {/* Кнопки действий */}
                <div className="action-buttons">
                    <button className="delete-account-btn">
                        Удалить аккаунт
                    </button>
                    <button className="save-changes-btn">
                        Сохранить изменения
                    </button>
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