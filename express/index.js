const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const port = process.env.PORT || 5000;

const { pool, checkConnection } = require('./db');

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // URL вашего React приложения
  credentials: true
}));
app.use(express.json());

// Middleware аутентификации
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const [users] = await pool.execute(
      'SELECT user_id, name, surname, nick, email, role, is_active, avatar_url, is_online FROM users WHERE user_id = ?',
      [decoded.userId]
    );

    if (users.length === 0 || !users[0].is_active) {
      return res.status(403).json({ error: 'Пользователь не найден или неактивен' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Неверный токен' });
  }
};

// Импортируем роуты
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Подключаем роуты
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Базовый маршрут
app.get('/', (req, res) => {
  res.json({ message: '🚀 Сервер работает отлично!' });
});

// Health check
app.get('/health', async (req, res) => {
  try {
    const dbConnected = await checkConnection();
    res.json({ 
      status: 'OK', 
      database: dbConnected ? 'Connected' : 'Disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ status: 'Error', error: error.message });
  }
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Маршрут не найден',
    path: req.originalUrl,
    method: req.method
  });
});

// Обработка ошибок
app.use((error, req, res, next) => {
  console.error('Ошибка сервера:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Запуск сервера
app.listen(port, async () => {
  console.log('🚀 Сервер запущен на порту: ' + port);
  await checkConnection();
});

module.exports = app;