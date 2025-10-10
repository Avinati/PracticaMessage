import React, { useState } from "react";
import "./css/Register.css";
import { Link, useNavigate } from 'react-router-dom';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        surname: '',
        nick: '',
        email: '',
        password: '',
        confirmPassword: '',
        avatar_url: ''
    });
    const [agreements, setAgreements] = useState({
        personalData: false,
        privacyPolicy: false,
        notifications: false
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        setAgreements(prev => ({
            ...prev,
            [name]: checked
        }));
    };

    const validateForm = () => {
        if (!formData.name || !formData.email || !formData.password) {
            setError('Все обязательные поля должны быть заполнены');
            return false;
        }

        if (formData.password.length < 6) {
            setError('Пароль должен быть не менее 6 символов');
            return false;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают');
            return false;
        }

        if (!agreements.personalData || !agreements.privacyPolicy) {
            setError('Необходимо согласие на обработку данных и политику конфиденциальности');
            return false;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setError('Некорректный формат email');
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateForm()) return;

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: formData.name,
                    surname: formData.surname,
                    nick: formData.nick,
                    email: formData.email,
                    password: formData.password,
                    avatar_url: formData.avatar_url
                })
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем токен в localStorage
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Перенаправляем в профиль
                navigate('/profile');
            } else {
                setError(data.error || 'Ошибка регистрации');
            }
        } catch (error) {
            console.error('Registration error:', error);
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="register-container">
            <div className="register-form">
                <h1 className="register-title">Регистрация</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            placeholder="Имя *" 
                            type="text" 
                            className="input-field" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                            placeholder="Фамилия" 
                            type="text" 
                            className="input-field" 
                            name="surname"
                            value={formData.surname}
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                            placeholder="Никнейм" 
                            type="text" 
                            className="input-field" 
                            name="nick"
                            value={formData.nick}
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                            placeholder="Email *" 
                            type="email" 
                            className="input-field" 
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                            placeholder="Пароль *" 
                            type="password" 
                            className="input-field" 
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                            placeholder="Повторите пароль *" 
                            type="password" 
                            className="input-field" 
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="input-group">
                        <input 
                            placeholder="URL аватара (необязательно)" 
                            type="url" 
                            className="input-field" 
                            name="avatar_url"
                            value={formData.avatar_url}
                            onChange={handleInputChange}
                        />
                    </div>
                    
                    <div className="checkbox-group">
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                name="personalData"
                                checked={agreements.personalData}
                                onChange={handleCheckboxChange}
                            />
                            <span className="checkbox-text">Я соглашаюсь на обработку персональных данных *</span>
                        </label>
                        
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                name="privacyPolicy"
                                checked={agreements.privacyPolicy}
                                onChange={handleCheckboxChange}
                            />
                            <span className="checkbox-text">Я соглашаюсь с Политикой Конфиденциальности этого сайта *</span>
                        </label>
                        
                        <label className="checkbox-label">
                            <input 
                                type="checkbox" 
                                className="checkbox-input" 
                                name="notifications"
                                checked={agreements.notifications}
                                onChange={handleCheckboxChange}
                            />
                            <span className="checkbox-text">Я соглашаюсь на получение уведомлений на почту</span>
                        </label>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="register-button"
                        disabled={loading}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                
                <div className="login-section">
                    <span className="login-text">Уже есть аккаунт? </span>
                    <Link to='/login'>
                        <span className="login-link">Войти!</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Register;