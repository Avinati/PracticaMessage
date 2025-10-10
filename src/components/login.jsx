import React, { useState } from "react";
import "./css/Login.css";
import { Link, useNavigate } from 'react-router-dom';

function Login() {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.email || !formData.password) {
            setError('Все поля обязательны для заполнения');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Сохраняем токен и данные пользователя
                localStorage.setItem('token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                
                // Перенаправляем в профиль
                navigate('/profile');
            } else {
                setError(data.error || 'Ошибка входа');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError('Ошибка подключения к серверу');
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = () => {
        // TODO: Реализовать восстановление пароля
        alert('Функция восстановления пароля в разработке');
    };

    return (
        <div className="login-container">
            <div className="login-form">
                <h1 className="login-title">Вход</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <input 
                            placeholder="Email" 
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
                            placeholder="Пароль" 
                            type="password" 
                            className="input-field" 
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    
                    <div className="forgot-password">
                        <button 
                            type="button" 
                            className="forgot-link"
                            onClick={handleForgotPassword}
                        >
                            Забыли пароль?
                        </button>
                    </div>
                    
                    <button 
                        type="submit" 
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? 'Вход...' : 'Войти'}
                    </button>
                </form>
                
                <div className="register-section">
                    <span className="register-text">Еще нет аккаунта? </span>
                    <Link to='/register'>
                        <span className="register-link">Регистрация!</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;