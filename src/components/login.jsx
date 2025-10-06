import React from "react";
import "./css/Login.css";
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'

function Login() {
    return (
        <div className="login-container">
            <div className="login-form">
                <h1 className="login-title">Вход</h1>
                
                <div className="input-group">
                    <input placeholder="Email" type="email" className="input-field" />
                </div>
                
                <div className="input-group">
                    <input placeholder="Пароль" type="password" className="input-field" />
                </div>
                
                <div className="forgot-password">
                    <a href="#" className="forgot-link">Забыли пароль?</a>
                </div>
                
                <button className="login-button">Войти</button>
                
                <div className="register-section">
                    <span className="register-text">Еще нет аккаунта? </span>
                    <Link to='/register'>
                    <a href="#" className="register-link">Регистрация!</a>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default Login;