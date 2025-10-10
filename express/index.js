const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const port = process.env.PORT || 5000;

const { pool, checkConnection } = require('./db');

app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true
}));
app.use(express.json());


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


const authRoutes = require('./routes/authRoutes')(pool, bcrypt, jwt, process.env.JWT_SECRET, authenticateToken);
const userRoutes = require('./routes/userRoutes')(pool, authenticateToken); 


app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

app.get('/api/test', (req, res) => {
  res.json({ message: 'API работает!' });
});


app.listen(port, async () => {
  console.log('🚀 Сервер запущен на порту: ' + port);
  await checkConnection();
  console.log('✅ Маршруты зарегистрированы:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   POST /api/users/profile');
  console.log('   GET  /api/test');
});