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
import '../components/css/upload.css'

function PostUpload() {
    return (
        <>
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

                        <div className="upload-main-lol">
                            <textarea className="textarr" name="" id="" placeholder="Ваш текст"></textarea>
                            <div className="btnn-use">
                                <button className="btn-add-media"> 
                                    <img src="../plus.png" alt="" /> 
                                    Добавить медиа 
                                </button>
                                <div className="btn-group">
                                    <button className="btn-cancel">Отменить</button>
                                    <button className="btn-submit">Выложить</button>
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
        </>
    )
}
export default PostUpload;