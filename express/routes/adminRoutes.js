const express = require('express');

const adminRoutes = (pool, authenticateToken) => {
  const router = express.Router();

  const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Требуются права администратора' });
    }
    next();
  };

  router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const [userStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_users,
          COUNT(CASE WHEN is_online = TRUE THEN 1 END) as online_users,
          COUNT(CASE WHEN is_active = FALSE THEN 1 END) as banned_users,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_users_today
        FROM users
      `);

      const [postStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_posts,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_posts_today,
          SUM(likes_count) as total_likes,
          SUM(comments_count) as total_comments
        FROM posts
        WHERE is_published = TRUE
      `);

      const [chatStats] = await pool.execute(`
        SELECT 
          COUNT(*) as total_chats,
          COUNT(CASE WHEN chat_type = 'group' THEN 1 END) as group_chats,
          COUNT(CASE WHEN DATE(created_at) = CURDATE() THEN 1 END) as new_chats_today
        FROM chats
      `);

      res.json({
        users: userStats[0],
        posts: postStats[0],
        chats: chatStats[0]
      });
    } catch (error) {
      console.error('Admin stats error:', error);
      res.status(500).json({ error: 'Ошибка получения статистики' });
    }
  });

  router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 20, search = '' } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;
      const searchQuery = `%${search}%`;

      let baseQuery = `
        SELECT 
          user_id, name, surname, nick, email, role, is_active, is_online,
          avatar_url, last_seen, created_at,
          (SELECT COUNT(*) FROM posts WHERE user_id = users.user_id) as posts_count,
          (SELECT COUNT(*) FROM friendships WHERE user_id1 = users.user_id OR user_id2 = users.user_id) as friends_count
        FROM users 
      `;

      let countQuery = `SELECT COUNT(*) as total FROM users`;
      let queryParams = [];
      let countParams = [];

      if (search) {
        baseQuery += ` WHERE name LIKE ? OR email LIKE ? OR nick LIKE ?`;
        countQuery += ` WHERE name LIKE ? OR email LIKE ? OR nick LIKE ?`;
        queryParams = [searchQuery, searchQuery, searchQuery];
        countParams = [searchQuery, searchQuery, searchQuery];
      }

      baseQuery += ` ORDER BY created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

      const [users] = await pool.execute(baseQuery, queryParams);
      const [total] = await pool.execute(countQuery, countParams);

      res.json({
        users,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(total[0].total / limitNum),
          total_users: total[0].total,
          has_more: offset + users.length < total[0].total
        }
      });
    } catch (error) {
      console.error('Admin users error:', error);
      res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
  });

  router.post('/users/:userId/toggle-ban', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (parseInt(userId) === req.user.user_id) {
        return res.status(400).json({ error: 'Нельзя заблокировать самого себя' });
      }

      const [users] = await pool.execute(
        'SELECT user_id, is_active FROM users WHERE user_id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.status(404).json({ error: 'Пользователь не найден' });
      }

      const newStatus = !users[0].is_active;

      await pool.execute(
        'UPDATE users SET is_active = ?, is_online = FALSE WHERE user_id = ?',
        [newStatus, userId]
      );

      res.json({
        message: newStatus ? 'Пользователь разблокирован' : 'Пользователь заблокирован',
        is_active: newStatus
      });
    } catch (error) {
      console.error('Toggle ban error:', error);
      res.status(500).json({ error: 'Ошибка изменения статуса пользователя' });
    }
  });

  router.get('/posts', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 20, status = 'all' } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      let baseQuery = `
        SELECT 
          p.*,
          u.name, u.surname, u.nick, u.avatar_url, u.email
        FROM posts p
        JOIN users u ON p.user_id = u.user_id
      `;

      let countQuery = `SELECT COUNT(*) as total FROM posts p`;
      let queryParams = [];
      let countParams = [];

      if (status === 'published') {
        baseQuery += ` WHERE p.is_published = TRUE`;
        countQuery += ` WHERE p.is_published = TRUE`;
      } else if (status === 'unpublished') {
        baseQuery += ` WHERE p.is_published = FALSE`;
        countQuery += ` WHERE p.is_published = FALSE`;
      }

      baseQuery += ` ORDER BY p.created_at DESC LIMIT ${limitNum} OFFSET ${offset}`;

      const [posts] = await pool.execute(baseQuery, queryParams);
      const [total] = await pool.execute(countQuery, countParams);

      res.json({
        posts,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(total[0].total / limitNum),
          total_posts: total[0].total
        }
      });
    } catch (error) {
      console.error('Admin posts error:', error);
      res.status(500).json({ error: 'Ошибка получения постов' });
    }
  });

  router.post('/posts/:postId/toggle-publish', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { postId } = req.params;

      const [posts] = await pool.execute(
        'SELECT post_id, is_published FROM posts WHERE post_id = ?',
        [postId]
      );

      if (posts.length === 0) {
        return res.status(404).json({ error: 'Пост не найден' });
      }

      const newStatus = !posts[0].is_published;

      await pool.execute(
        'UPDATE posts SET is_published = ? WHERE post_id = ?',
        [newStatus, postId]
      );

      res.json({
        message: newStatus ? 'Пост опубликован' : 'Пост снят с публикации',
        is_published: newStatus
      });
    } catch (error) {
      console.error('Toggle publish error:', error);
      res.status(500).json({ error: 'Ошибка изменения статуса поста' });
    }
  });

  router.delete('/posts/:postId', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { postId } = req.params;

      const [result] = await pool.execute(
        'DELETE FROM posts WHERE post_id = ?',
        [postId]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Пост не найден' });
      }

      res.json({ message: 'Пост успешно удален' });
    } catch (error) {
      console.error('Delete post error:', error);
      res.status(500).json({ error: 'Ошибка удаления поста' });
    }
  });

  router.get('/chats', authenticateToken, requireAdmin, async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const offset = (pageNum - 1) * limitNum;

      const query = `
        SELECT 
          c.*,
          u.name as creator_name,
          u.nick as creator_nick,
          COUNT(DISTINCT cp.user_id) as participants_count,
          COUNT(DISTINCT m.message_id) as messages_count,
          MAX(m.created_at) as last_message_date
        FROM chats c
        LEFT JOIN users u ON c.created_by = u.user_id
        LEFT JOIN chat_participants cp ON c.chat_id = cp.chat_id
        LEFT JOIN messages m ON c.chat_id = m.chat_id
        GROUP BY c.chat_id
        ORDER BY c.last_activity DESC
        LIMIT ${limitNum} OFFSET ${offset}
      `;

      const [chats] = await pool.execute(query);
      const [total] = await pool.execute('SELECT COUNT(*) as total FROM chats');

      res.json({
        chats,
        pagination: {
          current_page: pageNum,
          total_pages: Math.ceil(total[0].total / limitNum),
          total_chats: total[0].total
        }
      });
    } catch (error) {
      console.error('Admin chats error:', error);
      res.status(500).json({ error: 'Ошибка получения чатов' });
    }
  });

  return router;
};

module.exports = adminRoutes;