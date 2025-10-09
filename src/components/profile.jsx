// Profile.jsx
import React from "react";
import Logo from '/public/Лого.png';
import Fav from '/public/Fav.png';
import Pfp from '/public/pfp.png';
import './css/Profile.css';
import { Link } from 'react-router-dom';

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
                    <div className="profile-hero">
                        <div className="user-galaxy">
                            <img className="avatar-cosmic" src="./Аватарка.png" alt="Аватар" />
                            <div className="user-stardust">
                                <h3>demons are a girl's best friend</h3>
                                <p>@kabukiaku</p>
                            </div>
                        </div>
                        <div className="profile-info">
                            <div className="orbit-actions">
                                <button className="quantum-settings">
                                    <img className="settings-portal" src="./Настройки.png" alt="Настройки" />
                                </button>
                                <button className="nebula-chat">
                                    <img className="chat-wormhole" src="./chat1.png" alt="Чат" />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="cosmic-grid">
                        <div className="timeline-constellation">
                            <div className="timeline-header">
                                <h2>Лента</h2> 
                            </div>
                            
                            <div className="timeline-content">
                                <div className="post-header">
                                    <div className="post-identity">
                                        <img className="avatar-nova" src="./Аватарка.png" alt="Аватар" />
                                        <h2 className="username-pulsar">@vvandelo</h2>
                                        <img className="star-favorite" src="./favpost1.png" alt="Избранное" />
                                    </div>
                                </div>
                                <div className="post-universe">
                                    <img className="post-supernova" src="./haha.png" alt="Пост" />
                                </div>
                                <div className="post-actions">
                                    <img className="action-meteor" src="./like.png" alt="Лайк" />
                                    <img className="action-meteor" src="./comm.png" alt="Комментарий" />
                                    <img className="action-meteor" src="./share.png" alt="Поделиться" />
                                </div>
                            </div>
                        </div>

                        <div className="allies-constellation">
                            <div className="allies-header">
                                <h2>Союзники</h2> 
                            </div>

                            <div className="allies-content">
                                <div className="allies-cluster">
                                    <div className="ally-comet">
                                        <img className="avatar-satellite" src="./Аватарка.png" alt="Аватар союзника" />
                                        <div className="ally-info">
                                            <h3>@friend_user1</h3>
                                            <p>Online</p>
                                        </div>
                                        <button className="message-stargate">
                                            <img className="comet-message" src="./chat1.png" alt="Написать" />
                                        </button>
                                    </div>
                                    <div className="ally-comet">
                                        <img className="avatar-satellite" src="./Аватарка.png" alt="Аватар союзника" />
                                        <div className="ally-info">
                                            <h3>@friend_user2</h3>
                                            <p>Был(а) 5 мин назад</p>
                                        </div>
                                        <button className="message-stargate">
                                            <img className="comet-message" src="./chat1.png" alt="Написать" />
                                        </button>
                                    </div>
                                    <div className="ally-comet">
                                        <img className="avatar-satellite" src="./Аватарка.png" alt="Аватар союзника" />
                                        <div className="ally-info">
                                            <h3>@friend_user3</h3>
                                            <p>Online</p>
                                        </div>
                                        <button className="message-stargate">
                                            <img className="comet-message" src="./chat1.png" alt="Написать" />
                                        </button>
                                    </div>
                                    <div className="ally-comet">
                                        <img className="avatar-satellite" src="./Аватарка.png" alt="Аватар союзника" />
                                        <div className="ally-info">
                                            <h3>@friend_user4</h3>
                                            <p>Был(а) 2 часа назад</p>
                                        </div>
                                        <button className="message-stargate">
                                            <img className="comet-message" src="./chat1.png" alt="Написать" />
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
                                <ul>Союзники</ul>
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