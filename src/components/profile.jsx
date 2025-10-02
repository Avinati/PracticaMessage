import React from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import './css/Main.css'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import App from "../App";
function Profile() {
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
export default Profile;