const express = require('express');

const authRoutes = (pool, bcrypt, jwt, JWT_SECRET) => {
  const router = express.Router();


  router.post('/register', async (req, res) => {
    try {
      const { name, surname, nick, email, password, avatar_url } = req.body;

      
      if (!name || !email || !password) {
        return res.status(400).json({ 
          error: 'Нет достающих полей' 
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ 
          error: 'Сделай пароль длиннее' 
        });
      }

      
      const [existingUsers] = await pool.execute(
        'SELECT user_id FROM users WHERE email = ?',
        [email]
      );

      if (existingUsers.length > 0) {
        return res.status(409).json({ 
          error: 'Такой пользователь уже есть' 
        });
      }

      
      if (nick) {
        const [existingNicks] = await pool.execute(
          'SELECT user_id FROM users WHERE nick = ?',
          [nick]
        );

        if (existingNicks.length > 0) {
          return res.status(409).json({ 
            error: 'Этот ник уже занят' 
          });
        }
      }

      
      const hashedPassword = await bcrypt.hash(password, 12);

      
      const [result] = await pool.execute(
        `INSERT INTO users (name, surname, nick, email, password, avatar_url) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [name, surname || null, nick || null, email, hashedPassword, avatar_url || null]
      );

      
      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, email, role, is_active, avatar_url, 
                is_online, last_seen, created_at, updated_at 
         FROM users WHERE user_id = ?`,
        [result.insertId]
      );

      
      const token = jwt.sign(
        { userId: result.insertId, email: email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      
      await pool.execute(
        'UPDATE users SET is_online = TRUE WHERE user_id = ?',
        [result.insertId]
      );

      res.status(201).json({
        message: 'Регистрация успешная бля',
        token,
        user: users[0]
      });

    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ 
        error: 'Ошибка регистрации' 
      });
    }
  });

  
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;

     
      if (!email || !password) {
        return res.status(400).json({ 
          error: 'Нету почты и пароля' 
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
          error: 'Да ну его нах' 
        });
      }

      const user = users[0];

      
      if (!user.is_active) {
        return res.status(403).json({ 
          error: 'Аккаунт неактивен' 
        });
      }

      
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ 
          error: 'Ты инвалид' 
        });
      }

      
      const token = jwt.sign(
        { userId: user.user_id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

     
      await pool.execute(
        'UPDATE users SET is_online = TRUE WHERE user_id = ?',
        [user.user_id]
      );

      
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        message: 'Логин сработал',
        token,
        user: userWithoutPassword
      });

    } catch (error) {
      console.error('Ошибка логина:', error);
      res.status(500).json({ 
        error: 'Да ема е' 
      });
    }
  });

  
  router.post('/logout', authenticateToken, async (req, res) => {
    try {
      
      await pool.execute(
        'UPDATE users SET is_online = FALSE WHERE user_id = ?',
        [req.user.user_id]
      );

      res.json({ 
        message: 'Выход успешный' 
      });
    } catch (error) {
      console.error('Ошибка выхода:', error);
      res.status(500).json({ 
        error: 'Не удалось выйти' 
      });
    }
  });

  
  router.get('/verify', authenticateToken, (req, res) => {
    res.json({ 
      user: req.user,
      valid: true 
    });
  });

  return router;
};

module.exports = authRoutes;