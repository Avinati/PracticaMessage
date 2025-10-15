const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
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

// Создаем HTTP сервер для socket.io
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
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

const adminRoutes = require('./routes/adminRoutes')(pool, authenticateToken);

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

app.use('/api/admin', adminRoutes);

// Маршруты чатов
const chatRoutes = require('./routes/chatRoutes')(pool, authenticateToken);
app.use('/api/chats', chatRoutes);

// Socket.io подключения
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('🔌 Новое подключение:', socket.id);

  // Аутентификация пользователя
  socket.on('authenticate', async (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      
      const [users] = await pool.execute(
        'SELECT user_id, name, surname, nick, email, role, is_active, avatar_url FROM users WHERE user_id = ?',
        [decoded.userId]
      );

      if (users.length > 0 && users[0].is_active) {
        const user = users[0];
        connectedUsers.set(user.user_id, socket.id);
        socket.userId = user.user_id;
        
        // Обновляем статус онлайн
        await pool.execute(
          'UPDATE users SET is_online = TRUE, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?',
          [user.user_id]
        );

        // Уведомляем других пользователей
        socket.broadcast.emit('user_online', {
          user_id: user.user_id,
          is_online: true
        });

        console.log(`✅ Пользователь ${user.name} аутентифицирован`);
      }
    } catch (error) {
      console.error('Ошибка аутентификации socket:', error);
    }
  });

  // Присоединение к комнате чата
  socket.on('join_chat', (chatId) => {
    socket.join(`chat_${chatId}`);
    console.log(`Пользователь присоединился к чату: ${chatId}`);
  });

  // Отправка сообщения
  socket.on('send_message', async (data) => {
    try {
      const { chat_id, content, message_type = 'text', attachment_url = null } = data;
      
      // Сохраняем сообщение в БД
      const [result] = await pool.execute(
        `INSERT INTO messages (chat_id, user_id, content, message_type, attachment_url) 
         VALUES (?, ?, ?, ?, ?)`,
        [chat_id, socket.userId, content, message_type, attachment_url]
      );

      // Получаем полные данные сообщения
      const [messages] = await pool.execute(
        `SELECT m.*, u.name, u.surname, u.nick, u.avatar_url 
         FROM messages m 
         JOIN users u ON m.user_id = u.user_id 
         WHERE m.message_id = ?`,
        [result.insertId]
      );

      const message = messages[0];

      // Обновляем время последней активности чата
      await pool.execute(
        'UPDATE chats SET last_activity = CURRENT_TIMESTAMP WHERE chat_id = ?',
        [chat_id]
      );

      // Отправляем сообщение всем участникам чата
      io.to(`chat_${chat_id}`).emit('new_message', message);
      
      // Уведомляем участников чата о новом сообщении
      const [participants] = await pool.execute(
        'SELECT user_id FROM chat_participants WHERE chat_id = ? AND user_id != ?',
        [chat_id, socket.userId]
      );

      participants.forEach(participant => {
        const participantSocketId = connectedUsers.get(participant.user_id);
        if (participantSocketId) {
          io.to(participantSocketId).emit('chat_notification', {
            chat_id,
            message: content,
            sender: message.name
          });
        }
      });

    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
      socket.emit('message_error', { error: 'Не удалось отправить сообщение' });
    }
  });

  // Отметка сообщений как прочитанных
  socket.on('mark_as_read', async (data) => {
    try {
      const { chat_id, message_ids } = data;
      
      await pool.execute(
        `UPDATE messages SET is_read = TRUE, read_at = CURRENT_TIMESTAMP 
         WHERE message_id IN (?) AND chat_id = ?`,
        [message_ids, chat_id]
      );

      // Уведомляем других участников
      socket.to(`chat_${chat_id}`).emit('messages_read', {
        chat_id,
        message_ids,
        reader_id: socket.userId
      });

    } catch (error) {
      console.error('Ошибка отметки сообщений:', error);
    }
  });

  // Отключение пользователя
  socket.on('disconnect', async () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
      
      // Обновляем статус офлайн
      await pool.execute(
        'UPDATE users SET is_online = FALSE, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?',
        [socket.userId]
      );

      // Уведомляем других пользователей
      socket.broadcast.emit('user_offline', {
        user_id: socket.userId,
        is_online: false
      });

      console.log(`❌ Пользователь отключился: ${socket.userId}`);
    }
  });
});

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
server.listen(port, async () => {
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
console.log('   GET  /api/chats');
console.log('   POST /api/chats');
console.log('   GET  /api/chats/:id/messages');
console.log('   GET  /api/users/search');
console.log('   GET  /api/admin/stats');
console.log('   GET  /api/admin/users');
console.log('   POST /api/admin/users/:userId/toggle-ban');
console.log('   GET  /api/admin/posts');
console.log('   POST /api/admin/posts/:postId/toggle-publish');
console.log('   DELETE /api/admin/posts/:postId');
console.log('   GET  /api/admin/chats');
console.log('   GET  /api/test');
});