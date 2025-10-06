import React, { useState } from "react";
import Logo from '/public/Лого.png'
import Fav from '/public/Fav.png'
import Pfp from '/public/pfp.png'
import Plus from '/public/plus.png'
import Send from '/public/send.png'
import Back from '/public/back.png'
import './css/chat.css'

function Chat() {
    const [messages, setMessages] = useState([
        { id: 1, text: "Привет! Как дела?", time: "12:30", isSent: false },
        { id: 2, text: "Привет! Все отлично, спасибо! А у тебя?", time: "12:31", isSent: true },
        { id: 3, text: "Тоже все хорошо! Хочешь встретиться завтра?", time: "12:32", isSent: false },
    ]);
    
    const [newMessage, setNewMessage] = useState("");

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim() === "") return;
        
        const newMsg = {
            id: messages.length + 1,
            text: newMessage,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSent: true
        };
        
        setMessages([...messages, newMsg]);
        setNewMessage("");
    };

    const handleBack = () => {
        // Функция для возврата назад
        window.history.back();
    };

    return (
        <>
            <div className="main-content">
                <div className="header-box">
                    <div className="header-container">
                        <img className="logo" src={Logo} alt="Логотип" />
                        <input type="text" className="search-input" placeholder="Поиск..." />
                        <button className="fav-btn">
                            <img src={Fav} alt="Избранное" />
                        </button>
                        <button className="pfp-btn">
                            <img src={Pfp} alt="Профиль" />
                        </button>
                    </div>
                </div>

                <div className="content-wrapper">
                    <div className="chat-container">
                        {/* Заголовок чата */}
                        <div className="chat-header">
                            <button className="back-button" onClick={handleBack}>
                                <img src={Back} alt="Назад" />
                            </button>
                            <div className="chat-user-info">
                                <div className="avatar-container">
                                    <img src={Pfp} alt="Алексей Петров" className="chat-user-avatar" />
                                    <span className="online-dot"></span>
                                </div>
                                <div className="chat-user-details">
                                    <h3>Алексей Петров</h3>
                                    <span className="status">в сети</span>
                                </div>
                            </div>
                        </div>

                        {/* Область сообщений */}
                        <div className="messages-container">
                            {messages.map((message) => (
                                <div 
                                    key={message.id} 
                                    className={`message ${message.isSent ? 'message-sent' : 'message-received'}`}
                                >
                                    <div className="message-content">
                                        <p>{message.text}</p>
                                        <span className="message-time">{message.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Форма ввода сообщения */}
                        <form className="message-input-form" onSubmit={handleSendMessage}>
                            <div className="input-container">
                                <button type="button" className="attach-button">
                                    <img src={Plus} alt="Добавить файл" />
                                </button>
                                <input
                                    type="text"
                                    className="message-input"
                                    placeholder="Введите сообщение..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                />
                                <button type="submit" className="send-button">
                                    <img src={Send} alt="Отправить" />
                                </button>
                            </div>
                        </form>
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

export default Chat;