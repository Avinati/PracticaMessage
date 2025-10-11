import React, { useState } from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import './css/favorite.css'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import '../components/css/upload.css'

function PostUpload() {
    const navigate = useNavigate();
    const [postData, setPostData] = useState({
        title: "",
        content: ""
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPostData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!postData.title.trim()) {
            setMessage("Заголовок поста не может быть пустым");
            return;
        }

        if (!postData.content.trim()) {
            setMessage("Текст поста не может быть пустым");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setMessage("Войдите в аккаунт чтобы создать пост");
            navigate('/login');
            return;
        }

        setLoading(true);
        setMessage("");

        try {
            const response = await fetch('http://localhost:5000/api/users/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: postData.title.trim(),
                    content: postData.content.trim(),
                    is_public: true
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Пост успешно опубликован!");
                setPostData({ title: "", content: "" });
                
                // Перенаправляем на главную через 1.5 секунды
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setMessage(data.error || "Ошибка при публикации поста");
            }
        } catch (error) {
            console.error('Post creation error:', error);
            setMessage("Ошибка при создании поста");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (postData.title.trim() || postData.content.trim()) {
            if (window.confirm('Вы уверены, что хотите отменить создание поста? Все несохраненные данные будут потеряны.')) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    };

    const handleAddMedia = () => {
        alert("Функция добавления медиа будет реализована в будущем");
    };

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
                {/* Сообщение об ошибке/успехе */}
                {message && (
                    <div className={`upload-message ${message.includes('успешно') ? 'success' : 'error'}`}>
                        {message}
                    </div>
                )}

                {/* Поле для заголовка */}
                <input
                    type="text"
                    name="title"
                    className="title-input"
                    placeholder="Заголовок поста"
                    value={postData.title}
                    onChange={handleInputChange}
                    disabled={loading}
                    maxLength={200}
                />
                <div className="char-counter">
                    {postData.title.length}/200 символов
                </div>

                <textarea 
                    className="textarr" 
                    name="content"
                    placeholder="О чем вы хотите рассказать?"
                    value={postData.content}
                    onChange={handleInputChange}
                    disabled={loading}
                    maxLength={2000}
                />
                
                <div className="char-counter">
                    {postData.content.length}/2000 символов
                </div>
                
                <div className="btnn-use">
                    <button 
                        className="btn-add-media"
                        onClick={handleAddMedia}
                        type="button"
                        disabled={loading}
                    >
                        <span className="plus-icon">+</span>
                        Добавить медиа
                    </button>
                    <div className="btn-group">
                        <button 
                            className="btn-cancel"
                            onClick={handleCancel}
                            disabled={loading}
                            type="button"
                        >
                            Отменить
                        </button>
                        <button 
                            className="btn-submit"
                            onClick={handleSubmit}
                            disabled={loading || !postData.title.trim() || !postData.content.trim()}
                        >
                            {loading ? "Публикация..." : "Выложить"}
                        </button>
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
        </>
    );
}

export default PostUpload;