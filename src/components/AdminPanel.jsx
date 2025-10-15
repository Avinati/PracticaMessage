import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './css/AdminPanel.css';

function AdminPanel() {
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [chats, setChats] = useState([]);
    const [activeTab, setActiveTab] = useState('stats');
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        checkAdminAccess();
        loadStats();
    }, []);

    useEffect(() => {
        switch (activeTab) {
            case 'users':
                loadUsers();
                break;
            case 'posts':
                loadPosts();
                break;
            case 'chats':
                loadChats();
                break;
            default:
                loadStats();
        }
    }, [activeTab]);

    const checkAdminAccess = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                navigate('/');
                return;
            }

            const data = await response.json();
            if (data.user.role !== 'admin') {
                navigate('/');
            }
        } catch (error) {
            console.error('Admin access check failed:', error);
            navigate('/');
        }
    };

    const loadStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/stats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Error loading stats:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setUsers(data.users);
            }
        } catch (error) {
            console.error('Error loading users:', error);
        }
    };

    const loadPosts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/posts', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPosts(data.posts);
            }
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    };

    const loadChats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('http://localhost:5000/api/admin/chats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setChats(data.chats);
            }
        } catch (error) {
            console.error('Error loading chats:', error);
        }
    };

    const toggleUserBan = async (userId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/users/${userId}/toggle-ban`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                loadUsers(); // Перезагружаем список пользователей
            }
        } catch (error) {
            console.error('Error toggling user ban:', error);
        }
    };

    const togglePostPublish = async (postId, currentStatus) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:5000/api/admin/posts/${postId}/toggle-publish`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                loadPosts(); // Перезагружаем список постов
            }
        } catch (error) {
            console.error('Error toggling post publish:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('ru-RU');
    };

    if (loading) {
        return <div className="admin-panel loading">Загрузка админ-панели...</div>;
    }

    return (
        <div className="admin-panel">
            <div className="admin-header">
                <h1>Админ-панель</h1>
                <div className="admin-tabs">
                    <button 
                        className={`tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('stats')}
                    >
                        Статистика
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                        onClick={() => setActiveTab('users')}
                    >
                        Пользователи
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
                        onClick={() => setActiveTab('posts')}
                    >
                        Посты
                    </button>
                    <button 
                        className={`tab-btn ${activeTab === 'chats' ? 'active' : ''}`}
                        onClick={() => setActiveTab('chats')}
                    >
                        Чаты
                    </button>
                </div>
            </div>

            {activeTab === 'stats' && (
                <div className="admin-stats">
                    <div className="stat-card">
                        <h3>Всего пользователей</h3>
                        <div className="number">{stats.users?.total_users || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Онлайн сейчас</h3>
                        <div className="number">{stats.users?.online_users || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Новых сегодня</h3>
                        <div className="number">{stats.users?.new_users_today || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Заблокировано</h3>
                        <div className="number">{stats.users?.banned_users || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Всего постов</h3>
                        <div className="number">{stats.posts?.total_posts || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Постов сегодня</h3>
                        <div className="number">{stats.posts?.new_posts_today || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Всего чатов</h3>
                        <div className="number">{stats.chats?.total_chats || 0}</div>
                    </div>
                    <div className="stat-card">
                        <h3>Групповых чатов</h3>
                        <div className="number">{stats.chats?.group_chats || 0}</div>
                    </div>
                </div>
            )}

            {activeTab === 'users' && (
                <div className="admin-section">
                    <h2>Управление пользователями</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Имя</th>
                                <th>Email</th>
                                <th>Ник</th>
                                <th>Статус</th>
                                <th>Постов</th>
                                <th>Дата регистрации</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.user_id}>
                                    <td>{user.user_id}</td>
                                    <td>{user.name} {user.surname}</td>
                                    <td>{user.email}</td>
                                    <td>{user.nick || '-'}</td>
                                    <td>
                                        <span className={`user-status ${
                                            !user.is_active ? 'status-banned' : 
                                            user.is_online ? 'status-online' : 'status-offline'
                                        }`}>
                                            {!user.is_active ? 'Заблокирован' : 
                                             user.is_online ? 'Онлайн' : 'Офлайн'}
                                        </span>
                                    </td>
                                    <td>{user.posts_count}</td>
                                    <td>{formatDate(user.created_at)}</td>
                                    <td>
                                        <div className="admin-actions">
                                            <button 
                                                className={`btn ${user.is_active ? 'btn-danger' : 'btn-success'}`}
                                                onClick={() => toggleUserBan(user.user_id, user.is_active)}
                                            >
                                                {user.is_active ? 'Заблокировать' : 'Разблокировать'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'posts' && (
                <div className="admin-section">
                    <h2>Модерация постов</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Автор</th>
                                <th>Заголовок</th>
                                <th>Лайков</th>
                                <th>Комментариев</th>
                                <th>Статус</th>
                                <th>Дата</th>
                                <th>Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.post_id}>
                                    <td>{post.post_id}</td>
                                    <td>{post.name} ({post.email})</td>
                                    <td>{post.title || 'Без заголовка'}</td>
                                    <td>{post.likes_count}</td>
                                    <td>{post.comments_count}</td>
                                    <td>
                                        <span className={`user-status ${
                                            post.is_published ? 'status-online' : 'status-banned'
                                        }`}>
                                            {post.is_published ? 'Опубликован' : 'Скрыт'}
                                        </span>
                                    </td>
                                    <td>{formatDate(post.created_at)}</td>
                                    <td>
                                        <div className="admin-actions">
                                            <button 
                                                className={`btn ${post.is_published ? 'btn-warning' : 'btn-success'}`}
                                                onClick={() => togglePostPublish(post.post_id, post.is_published)}
                                            >
                                                {post.is_published ? 'Снять' : 'Опубликовать'}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'chats' && (
                <div className="admin-section">
                    <h2>Управление чатами</h2>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Тип</th>
                                <th>Название</th>
                                <th>Создатель</th>
                                <th>Участников</th>
                                <th>Сообщений</th>
                                <th>Последняя активность</th>
                                <th>Дата создания</th>
                            </tr>
                        </thead>
                        <tbody>
                            {chats.map(chat => (
                                <tr key={chat.chat_id}>
                                    <td>{chat.chat_id}</td>
                                    <td>{chat.chat_type === 'group' ? 'Групповой' : 'Приватный'}</td>
                                    <td>{chat.chat_name || 'Без названия'}</td>
                                    <td>{chat.creator_name} ({chat.creator_nick})</td>
                                    <td>{chat.participants_count}</td>
                                    <td>{chat.messages_count}</td>
                                    <td>{formatDate(chat.last_activity)}</td>
                                    <td>{formatDate(chat.created_at)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminPanel;