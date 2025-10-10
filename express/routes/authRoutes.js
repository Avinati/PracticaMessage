const express = require('express');

const authRoutes = (pool, bcrypt, jwt, JWT_SECRET, authenticateToken) => {
  const router = express.Router();

  // Регистрация
  router.post('/register', async (req, res) => {
    try {
      const { name, surname, nick, email, password, avatar_url } = req.body;

      // Валидация
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: 'Обязательные поля: имя, email и пароль' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Пароль должен быть не менее 6 символов' 
        });
      }

      if (!validateEmail(email)) {
        return res.status(400).json({ 
          error: 'Некорректный формат email' 
        });
      }

      // Проверка существующего email
      const [existingUsers] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({ 
          error: 'Пользователь с таким email уже существует' 
        });
      }

      // Проверка ника если указан
      if (nick) {
        const [existingNicks] = await pool.execute(
          'SELECT user_id FROM users WHERE nick = ?',
          [nick]
        );

        if (existingNicks.length > 0) {
          return res.status(409).json({ 
            error: 'Этот никнейм уже занят' 
          });
        }
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 12);

      // Создание пользователя
      const [result] = await pool.execute(
        `INSERT INTO users (name, surname, nick, email, password, avatar_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, surname || null, nick || null, email, hashedPassword, avatar_url || null]
      );

      // Получение созданного пользователя
      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, email, role, is_active, avatar_url, 
                is_online, last_seen, created_at, updated_at 
         FROM users WHERE user_id = ?`,
        [result.insertId]
      );

      // Генерация токена
      const token = jwt.sign(
        { userId: result.insertId, email: email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Обновление статуса онлайн
      await pool.execute(
        'UPDATE users SET is_online = TRUE WHERE user_id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'Регистрация успешна',
        token,
        user: users[0]
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Ошибка при регистрации' 
      });
    }
  });

  // Логин
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Email и пароль обязательны' 
        });
      }

      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, email, password, role, 
                is_active, avatar_url, is_online 
         FROM users WHERE email = ?`,
        [email]
      );

      if (users.length === 0) {
        return res.status(401).json({ 
          error: 'Неверный email или пароль' 
        });
      }

      const user = users[0];

      if (!user.is_active) {
        return res.status(403).json({ 
          error: 'Аккаунт деактивирован' 
        });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Неверный email или пароль' 
        });
      }

      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      await pool.execute(
        'UPDATE users SET is_online = TRUE, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?',
        [user.user_id]
      );

      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Вход выполнен успешно',
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Ошибка входа:', error);
      res.status(500).json({ 
        error: 'Ошибка при входе в систему' 
      });
    }
  });

  // Выход
  router.post('/logout', authenticateToken, async (req, res) => {
    try {
      await pool.execute(
        'UPDATE users SET is_online = FALSE, last_seen = CURRENT_TIMESTAMP WHERE user_id = ?',
        [req.user.user_id]
      );

      res.json({ 
        message: 'Выход выполнен успешно' 
      });
    } catch (error) {
      console.error('Ошибка выхода:', error);
      res.status(500).json({ 
        error: 'Не удалось выйти из системы' 
      });
    }
  });

  // Проверка токена
  router.get('/verify', authenticateToken, (req, res) => {
    res.json({ 
      user: req.user,
      valid: true 
    });
  });

  // Вспомогательная функция валидации email
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  return router;
};

module.exports = authRoutes;