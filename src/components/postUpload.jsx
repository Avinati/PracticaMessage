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
        content: "",
        image: null
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPostData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Проверка типа файла
            if (!file.type.startsWith('image/')) {
                setMessage("Пожалуйста, выберите изображение");
                return;
            }

            // Проверка размера файла (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setMessage("Размер изображения не должен превышать 5MB");
                return;
            }

            setPostData(prev => ({
                ...prev,
                image: file
            }));

            // Создание превью
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setPostData(prev => ({
            ...prev,
            image: null
        }));
        setImagePreview(null);
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
            let imageUrl = null;

            // Если есть изображение, загружаем его сначала
            if (postData.image) {
                const formData = new FormData();
                formData.append('file', postData.image);

                const uploadResponse = await fetch('http://localhost:5000/api/users/upload', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
                    body: formData
                });

                const uploadData = await uploadResponse.json();

                if (!uploadResponse.ok) {
                    throw new Error(uploadData.error || 'Ошибка загрузки изображения');
                }

                imageUrl = uploadData.fileUrl;
            }

            // Создаем пост с изображением
            const response = await fetch('http://localhost:5000/api/users/posts', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: postData.title.trim(),
                    content: postData.content.trim(),
                    image_url: imageUrl,
                    is_public: true
                })
            });

            const data = await response.json();

            if (response.ok) {
                setMessage("Пост успешно опубликован!");
                setPostData({ title: "", content: "", image: null });
                setImagePreview(null);
                
                // Перенаправляем на главную через 1.5 секунды
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setMessage(data.error || "Ошибка при публикации поста");
            }
        } catch (error) {
            console.error('Post creation error:', error);
            setMessage(error.message || "Ошибка при создании поста");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        if (postData.title.trim() || postData.content.trim() || postData.image) {
            if (window.confirm('Вы уверены, что хотите отменить создание поста? Все несохраненные данные будут потеряны.')) {
                navigate('/');
            }
        } else {
            navigate('/');
        }
    };

    const handleAddMedia = () => {
        document.getElementById('image-upload').click();
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

                {/* Скрытый input для загрузки изображений */}
                <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                />

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

                {/* Превью изображения */}
                {imagePreview && (
                    <div className="image-preview-container">
                        <div className="image-preview">
                            <img src={imagePreview} alt="Превью" />
                            <button 
                                type="button" 
                                className="remove-image-btn"
                                onClick={removeImage}
                                disabled={loading}
                            >
                                ×
                            </button>
                        </div>
                    </div>
                )}

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
                        {postData.image ? "Заменить изображение" : "Добавить изображение"}
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