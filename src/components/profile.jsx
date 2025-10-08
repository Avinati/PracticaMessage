import React from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import './css/Profile.css'
import { Link } from 'react-router-dom'

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
                
                <div className="main-profile">
                    <div className="profile-content">
                        <div className="avatar-section">
                            <img className="avaava" src="./Аватарка.png" alt="Аватар" />
                            <div className="profile-text">
                                <h3>demons are a girl's best friend</h3>
                                <p>@kabukiaku</p>
                            </div>
                        </div>
                        <div className="profile-info">
                            <div className="profile-actions">
                                <button className="settings-btn">
                                    <img className="setting-buttn" src="./Настройки.png" alt="Настройки" />
                                </button>
                                <button className="chat-btn1">
                                    <img className="chat-btn1-img" src="./chat1.png" alt="Чат" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="content-wrapper">
                        <div className="lenta-section">
                            <div className="lenta-h2">
                                <h2>Лента</h2> 
                            </div>
                            
                            <div className="lenta">
                                <div className="header-lenta">
                                    <div className="left-lenta">
                                        <img className="avaava2" src="./Аватарка.png" alt="Аватар" />
                                        <h2 className="h2-lenta">@vvandelo</h2>
                                        <img className="fav11" src="./favpost1.png" alt="Избранное" />
                                    </div>
                                </div>
                                <div className="main-lenta">
                                    <img src="./haha.png" alt="Пост" />
                                </div>
                                <div className="footer-lenta">
                                    <img src="./like.png" alt="Лайк" />
                                    <img src="./comm.png" alt="Комментарий" />
                                    <img src="./share.png" alt="Поделиться" />
                                </div>
                            </div>
                        </div>

                        <div className="friend-section">
                            <div className="friend-h2">
                                <h2>Друзья</h2> 
                            </div>

                            <div className="friend-main">
                                <div className="friends-list">
                                    <div className="friend-item">
                                        <img className="friend-avatar" src="./Аватарка.png" alt="Аватар друга" />
                                        <div className="friend-info">
                                            <h3>@friend_user1</h3>
                                            <p>Online</p>
                                        </div>
                                        <button className="message-friend-btn">
                                            <img src="./chat1.png" alt="Написать" />
                                        </button>
                                    </div>
                                    <div className="friend-item">
                                        <img className="friend-avatar" src="./Аватарка.png" alt="Аватар друга" />
                                        <div className="friend-info">
                                            <h3>@friend_user2</h3>
                                            <p>Был(а) 5 мин назад</p>
                                        </div>
                                        <button className="message-friend-btn">
                                            <img src="./chat1.png" alt="Написать" />
                                        </button>
                                    </div>
                                    <div className="friend-item">
                                        <img className="friend-avatar" src="./Аватарка.png" alt="Аватар друга" />
                                        <div className="friend-info">
                                            <h3>@friend_user3</h3>
                                            <p>Online</p>
                                        </div>
                                        <button className="message-friend-btn">
                                            <img src="./chat1.png" alt="Написать" />
                                        </button>
                                    </div>
                                    <div className="friend-item">
                                        <img className="friend-avatar" src="./Аватарка.png" alt="Аватар друга" />
                                        <div className="friend-info">
                                            <h3>@friend_user4</h3>
                                            <p>Был(а) 2 часа назад</p>
                                        </div>
                                        <button className="message-friend-btn">
                                            <img src="./chat1.png" alt="Написать" />
                                        </button>
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

export default Profile;