const express = require('express');

const userRoutes = (pool, authenticateToken) => {
  const router = express.Router();

  // Получение профиля текущего пользователя
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, email, role, is_active, avatar_url, 
                is_online, last_seen, created_at, updated_at 
         FROM users WHERE user_id = ?`,
        [req.user.user_id]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      res.json({ user: users[0] });
    } catch (error) {
      console.error('Profile error:', error);
      res.status(500).json({ error: 'Ошибка получения профиля' });
    }
  });

  // Обновление профиля
  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      const { name, surname, nick, avatar_url } = req.body;
      const userId = req.user.user_id;

      // Проверка ника на уникальность
      if (nick && nick !== req.user.nick) {
        const [existingNicks] = await pool.execute(
          'SELECT user_id FROM users WHERE nick = ? AND user_id != ?',
          [nick, userId]
        );

        if (existingNicks.length > 0) {
          return res.status(409).json({ error: 'Этот никнейм уже занят' });
        }
      }

      await pool.execute(
        `UPDATE users 
         SET name = ?, surname = ?, nick = ?, avatar_url = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [
          name || req.user.name, 
          surname !== undefined ? surname : req.user.surname,
          nick || req.user.nick, 
          avatar_url !== undefined ? avatar_url : req.user.avatar_url, 
          userId
        ]
      );

      // Получаем обновленные данные
      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, email, role, is_active, avatar_url, 
                is_online, last_seen, created_at, updated_at 
         FROM users WHERE user_id = ?`,
        [userId]
      );

      res.json({
        message: 'Профиль обновлен',
        user: users[0]
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
  });

  // Поиск пользователей
  router.get('/search', authenticateToken, async (req, res) => {
    try {
      const { query } = req.query;
      
      if (!query || query.length < 2) {
        return res.status(400).json({ error: 'Поисковый запрос должен быть не менее 2 символов' });
      }

      const searchQuery = `%${query}%`;
      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, avatar_url, is_online, last_seen 
         FROM users 
         WHERE (name LIKE ? OR surname LIKE ? OR nick LIKE ?) 
         AND user_id != ? 
         AND is_active = TRUE 
         LIMIT 20`,
        [searchQuery, searchQuery, searchQuery, req.user.user_id]
      );

      res.json({ users });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({ error: 'Ошибка поиска' });
    }
  });

  return router;
};

module.exports = userRoutes;