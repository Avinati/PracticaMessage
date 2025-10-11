const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const port = process.env.PORT || 5000;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Создаем папку для загрузок если её нет
const uploadsDir = './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Подключение к базе данных
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'AppMessageSun',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Функция проверки подключения к БД
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Успешное подключение к базе данных');
    connection.release();
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:', error.message);
  }
};

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Middleware аутентификации
const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен отсутствует' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    const [users] = await pool.execute(
      'SELECT user_id, name, surname, nick, email, role, is_active, avatar_url, cover_url, is_online FROM users WHERE user_id = ?',
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

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Только изображения разрешены'), false);
    }
  }
});

// Маршруты аутентификации
const authRoutes = require('./routes/authRoutes')(pool, bcrypt, jwt, process.env.JWT_SECRET || 'your-secret-key', authenticateToken);
app.use('/api/auth', authRoutes);

// Маршруты пользователей
const userRoutes = require('./routes/userRoutes')(pool, authenticateToken, upload);
app.use('/api/users', userRoutes);

// Тестовые endpoint'ы
app.get('/api/test', (req, res) => {
  res.json({ message: 'API работает!' });
});

app.post('/api/test-body', (req, res) => {
  console.log('Test body:', req.body);
  res.json({ 
    message: 'Body received',
    body: req.body 
  });
});

// Обработка ошибок Multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'Размер файла не должен превышать 5MB' });
    }
  }
  res.status(500).json({ error: error.message });
});

// Запуск сервера
app.listen(port, async () => {
  console.log('🚀 Сервер запущен на порту: ' + port);
  await checkConnection();
  console.log('✅ Маршруты зарегистрированы:');
  console.log('   POST /api/auth/register');
  console.log('   POST /api/auth/login');
  console.log('   GET  /api/auth/verify');
  console.log('   GET  /api/users/profile');
  console.log('   PUT  /api/users/profile');
  console.log('   POST /api/users/upload');
  console.log('   DELETE /api/users/delete-account');
  console.log('   GET  /api/test');
});