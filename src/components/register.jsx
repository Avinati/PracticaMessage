import React from "react";
import "./css/Register.css";
import { Link } from 'react-router-dom';

function Register() {
    return (
        <div className="register-container">
            <div className="register-form">
                <h1 className="register-title">Регистрация</h1>
                
                <div className="input-group">
                    <input placeholder="Ф.И.О." type="text" className="input-field" />
                </div>
                
                <div className="input-group">
                    <input placeholder="Email" type="email" className="input-field" />
                </div>
                
                <div className="input-group">
                    <input placeholder="Пароль" type="password" className="input-field" />
                </div>
                
                <div className="input-group">
                    <input placeholder="Повторите пароль" type="password" className="input-field" />
                </div>
                
                <div className="checkbox-group">
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" />
                        <span className="checkbox-text">Я соглашаюсь на обработку персональных данных</span>
                    </label>
                    
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" />
                        <span className="checkbox-text">Я соглашаюсь с Политикой Конфиденциальности этого сайта</span>
                    </label>
                    
                    <label className="checkbox-label">
                        <input type="checkbox" className="checkbox-input" />
                        <span className="checkbox-text">Я соглашаюсь на получение уведомлений на почту</span>
                    </label>
                </div>
                
                <button className="register-button">Зарегистрироваться</button>
                
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