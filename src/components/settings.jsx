import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import Logo from '/public/Лого.png';
import Fav from '/public/Fav.png';
import Pfp from '/public/pfp.png';
import ForYou from '/public/person.png';
import Friends from '/public/friends.png';
import Chat from '/public/chat.png';
import Set from '/public/settingsred.png';
import './css/settings.css';

function Settings() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState({
        name: '',
        surname: '',
        nick: '',
        email: '',
        birthDate: '',
        avatar_url: '',
        cover_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);
    const [uploading, setUploading] = useState({
        avatar: false,
        cover: false
    });

    // Проверка аутентификации при загрузке компонента
    useEffect(() => {
        checkAuthentication();
    }, []);

    const checkAuthentication = async () => {
        const token = localStorage.getItem('token');
        
        if (!token) {
            setIsAuthenticated(false);
            setAuthChecked(true);
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setIsAuthenticated(true);
                fetchUserProfile();
            } else {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Ошибка проверки аутентификации:', error);
            setIsAuthenticated(false);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setAuthChecked(true);
        }
    };

    // Получение данных пользователя
    const fetchUserProfile = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setIsAuthenticated(false);
                return;
            }

            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUserData({
                    name: data.user.name || '',
                    surname: data.user.surname || '',
                    nick: data.user.nick || '',
                    email: data.user.email || '',
                    birthDate: data.user.birthDate || '',
                    avatar_url: data.user.avatar_url || Pfp,
                    cover_url: data.user.cover_url || ''
                });
            } else if (response.status === 401) {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
            }
        } catch (error) {
            console.error('Ошибка при загрузке профиля:', error);
            setMessage('Ошибка при загрузке профиля');
        }
    };

    // Загрузка файла на сервер
    const uploadFile = async (file, type) => {
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        try {
            const response = await fetch('http://localhost:5000/api/users/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            if (!response.ok) {
                throw new Error('Ошибка загрузки файла');
            }

            const data = await response.json();
            return data.fileUrl;
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            throw error;
        }
    };

    // Обновление URL аватара или обложки в профиле
    const updateProfileImage = async (imageUrl, field) => {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    [field]: imageUrl
                })
            });

            if (!response.ok) {
                throw new Error('Ошибка обновления профиля');
            }

            return await response.json();
        } catch (error) {
            console.error('Ошибка обновления:', error);
            throw error;
        }
    };

    // Загрузка аватара
    const handleAvatarChange = async (event) => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы изменить аватар');
            navigate('/login');
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
            setMessage('Пожалуйста, выберите изображение');
            return;
        }

        // Проверка размера файла (макс 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage('Размер файла не должен превышать 5MB');
            return;
        }

        setUploading(prev => ({ ...prev, avatar: true }));
        setMessage('');

        try {
            // Загружаем файл
            const fileUrl = await uploadFile(file, 'avatar');
            
            // Обновляем профиль
            await updateProfileImage(fileUrl, 'avatar_url');
            
            // Обновляем состояние
            setUserData(prev => ({ ...prev, avatar_url: fileUrl }));
            setMessage('Аватар успешно обновлен!');
            
        } catch (error) {
            console.error('Ошибка загрузки аватара:', error);
            setMessage('Ошибка при загрузке аватара');
        } finally {
            setUploading(prev => ({ ...prev, avatar: false }));
            event.target.value = ''; // Сбрасываем input
        }
    };

    // Загрузка обложки
    const handleCoverChange = async (event) => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы изменить обложку');
            navigate('/login');
            return;
        }

        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setMessage('Пожалуйста, выберите изображение');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setMessage('Размер файла не должен превышать 5MB');
            return;
        }

        setUploading(prev => ({ ...prev, cover: true }));
        setMessage('');

        try {
            const fileUrl = await uploadFile(file, 'cover');
            await updateProfileImage(fileUrl, 'cover_url');
            
            setUserData(prev => ({ ...prev, cover_url: fileUrl }));
            setMessage('Обложка успешно обновлена!');
            
        } catch (error) {
            console.error('Ошибка загрузки обложки:', error);
            setMessage('Ошибка при загрузке обложки');
        } finally {
            setUploading(prev => ({ ...prev, cover: false }));
            event.target.value = '';
        }
    };

    // Сохранение изменений
    const handleSaveChanges = async () => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы сохранить изменения');
            navigate('/login');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name: userData.name,
                    surname: userData.surname,
                    nick: userData.nick,
                    avatar_url: userData.avatar_url,
                    cover_url: userData.cover_url
                })
            });

            if (response.status === 401) {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('Сессия истекла. Войдите снова.');
                return;
            }

            const data = await response.json();

            if (response.ok) {
                setMessage('Изменения успешно сохранены!');
                fetchUserProfile();
            } else {
                setMessage(data.error || 'Ошибка при сохранении изменений');
            }
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
            setMessage('Ошибка при сохранении изменений');
        } finally {
            setLoading(false);
        }
    };

    // Удаление аккаунта
    const handleDeleteAccount = async () => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы удалить его');
            navigate('/login');
            return;
        }

        if (!window.confirm('Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/users/delete-account', {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.status === 401) {
                setIsAuthenticated(false);
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                alert('Сессия истекла. Войдите снова.');
                return;
            }

            if (response.ok) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/');
                alert('Аккаунт успешно удален');
            } else {
                const data = await response.json();
                setMessage(data.error || 'Ошибка при удалении аккаунта');
            }
        } catch (error) {
            console.error('Ошибка при удалении аккаунта:', error);
            setMessage('Ошибка при удалении аккаунта');
        }
    };

    // Обработчик изменения полей
    const handleInputChange = (field, value) => {
        if (!isAuthenticated) {
            alert('Войдите в аккаунт чтобы редактировать профиль');
            navigate('/login');
            return;
        }
        setUserData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // Обработчик клика по кнопке профиля
    const handleProfileClick = () => {
        if (!isAuthenticated) {
            navigate('/login');
        } else {
            navigate('/profile');
        }
    };

    // Если проверка авторизации еще не завершена, показываем загрузку
    if (!authChecked) {
        return (
            <div className="main-content">
                <div className="loading">Проверка авторизации...</div>
            </div>
        );
    }

    return (
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
                    <button 
                        className="pfp-btn" 
                        onClick={handleProfileClick}
                    >
                        <img src={Pfp} alt="Профиль" />
                    </button>
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
                        <button className="friends-btn">
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
                    {/* Сообщения об ошибках/успехе */}
                    {message && (
                        <div className={`message ${message.includes('успешно') ? 'success' : 'error'}`}>
                            {message}
                        </div>
                    )}

                    {/* Баннер если не авторизован */}
                    {!isAuthenticated && (
                        <div className="auth-warning">
                            <div className="warning-content">
                                <h3>🔐 Требуется авторизация</h3>
                                <p>Войдите в аккаунт чтобы получить доступ к настройкам профиля</p>
                                <button 
                                    className="login-warning-btn"
                                    onClick={() => navigate('/login')}
                                >
                                    Войти в аккаунт
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="profile-header">
                        <div 
                            className="cover-photo"
                            style={{
                                backgroundImage: userData.cover_url ? `url(${userData.cover_url})` : 'none',
                                backgroundColor: userData.cover_url ? 'transparent' : '#f0f0f0'
                            }}
                        >
                            <div className="avatar-section">
                                <img 
                                    src={isAuthenticated ? (userData.avatar_url || Pfp) : Pfp} 
                                    alt="Аватар" 
                                    className="profile-avatar" 
                                />
                                <h2 className="username">
                                    @{isAuthenticated ? (userData.nick || 'username') : 'guest'}
                                </h2>
                                <div className="photo-buttons">
                                    <div className="file-input-wrapper">
                                        <input 
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            onChange={handleAvatarChange}
                                            disabled={uploading.avatar || !isAuthenticated}
                                            style={{ display: 'none' }}
                                        />
                                        <label 
                                            htmlFor="avatar-upload" 
                                            className="change-btn"
                                        >
                                            {uploading.avatar ? 'Загрузка...' : 'Изменить аватар'}
                                        </label>
                                    </div>
                                    <div className="file-input-wrapper">
                                        <input 
                                            type="file"
                                            id="cover-upload"
                                            accept="image/*"
                                            onChange={handleCoverChange}
                                            disabled={uploading.cover || !isAuthenticated}
                                            style={{ display: 'none' }}
                                        />
                                        <label 
                                            htmlFor="cover-upload" 
                                            className="change-btn"
                                        >
                                            {uploading.cover ? 'Загрузка...' : 'Изменить обложку'}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="settings-form">
                        <div className="setting-group">
                            <label htmlFor="name">Имя</label>
                            <input 
                                type="text" 
                                id="name"
                                className="setting-input"
                                placeholder={isAuthenticated ? "Введите ваше имя" : "Войдите для редактирования"}
                                value={isAuthenticated ? userData.name : ''}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                disabled={loading || !isAuthenticated}
                            />
                        </div>

                        <div className="setting-group">
                            <label htmlFor="surname">Фамилия</label>
                            <input 
                                type="text" 
                                id="surname"
                                className="setting-input"
                                placeholder={isAuthenticated ? "Введите вашу фамилию" : "Войдите для редактирования"}
                                value={isAuthenticated ? userData.surname : ''}
                                onChange={(e) => handleInputChange('surname', e.target.value)}
                                disabled={loading || !isAuthenticated}
                            />
                        </div>

                        <div className="setting-group">
                            <label htmlFor="nick">Никнейм</label>
                            <input 
                                type="text" 
                                id="nick"
                                className="setting-input"
                                placeholder={isAuthenticated ? "Введите ваш никнейм" : "Войдите для редактирования"}
                                value={isAuthenticated ? userData.nick : ''}
                                onChange={(e) => handleInputChange('nick', e.target.value)}
                                disabled={loading || !isAuthenticated}
                            />
                        </div>

                        <div className="setting-group">
                            <label htmlFor="email">Email</label>
                            <input 
                                type="email" 
                                id="email"
                                className="setting-input"
                                placeholder={isAuthenticated ? "Введите ваш email" : "Войдите для просмотра"}
                                value={isAuthenticated ? userData.email : ''}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={true}
                            />
                            <small style={{color: '#666', fontSize: '12px'}}>
                                {isAuthenticated ? 'Email нельзя изменить' : 'Войдите чтобы увидеть email'}
                            </small>
                        </div>

                        <div className="setting-group">
                            <label htmlFor="birthDate">Дата рождения</label>
                            <input 
                                type="date" 
                                id="birthDate"
                                className="setting-input"
                                value={isAuthenticated ? userData.birthDate : ''}
                                onChange={(e) => handleInputChange('birthDate', e.target.value)}
                                disabled={loading || !isAuthenticated}
                            />
                        </div>

                        {/* Кнопки действий */}
                        <div className="action-buttons">
                            <button 
                                className="delete-account-btn"
                                onClick={handleDeleteAccount}
                                disabled={loading || !isAuthenticated}
                            >
                                {loading ? 'Загрузка...' : 'Удалить аккаунт'}
                            </button>
                            <button 
                                className="save-changes-btn"
                                onClick={handleSaveChanges}
                                disabled={loading || !isAuthenticated}
                            >
                                {loading ? 'Сохранение...' : 'Сохранить изменения'}
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
                            <ul>Настройки</ul>
                            <ul>Чаты</ul>
                        </div>
                        <div className="footer-column">
                            <li>Документация</li>
                            <ul>Условия пользования</ul>
                            <ul>Условия использования</ul>
                            <ul>Политика куки</ul>
                            <ul>Политика конфиденциальности</ul>
                            <ul>О нас</ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Settings;