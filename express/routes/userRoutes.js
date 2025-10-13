const express = require('express');
const path = require('path');
const fs = require('fs');

const userRoutes = (pool, authenticateToken, upload) => {
  const router = express.Router();

  // Получение профиля пользователя
  router.get('/profile', authenticateToken, async (req, res) => {
    try {
      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, email, role, is_active, 
                avatar_url, cover_url, is_online, last_seen, created_at, updated_at 
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

  // Обновление профиля пользователя
  router.put('/profile', authenticateToken, async (req, res) => {
    try {
      const { name, surname, nick, avatar_url, cover_url } = req.body;
      const userId = req.user.user_id;

      // Проверка уникальности никнейма
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
         SET name = ?, surname = ?, nick = ?, 
             avatar_url = ?, cover_url = ?, updated_at = CURRENT_TIMESTAMP 
         WHERE user_id = ?`,
        [
          name || req.user.name, 
          surname !== undefined ? surname : req.user.surname,
          nick || req.user.nick, 
          avatar_url !== undefined ? avatar_url : req.user.avatar_url,
          cover_url !== undefined ? cover_url : req.user.cover_url,
          userId
        ]
      );

      // Получаем обновленные данные
      const [users] = await pool.execute(
        `SELECT user_id, name, surname, nick, email, role, is_active, 
                avatar_url, cover_url, is_online, last_seen, created_at, updated_at 
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

  // Загрузка файлов (аватар/обложка)
  router.post('/upload', authenticateToken, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Файл не загружен' });
      }

      // Формируем URL файла
      const fileUrl = `http://localhost:5000/uploads/${req.file.filename}`;

      res.json({
        message: 'Файл успешно загружен',
        fileUrl: fileUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({ error: 'Ошибка загрузки файла' });
    }
  });

  // Удаление аккаунта
  router.delete('/delete-account', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.user_id;
      
      // Вместо полного удаления, деактивируем аккаунт
      await pool.execute(
        'UPDATE users SET is_active = FALSE, is_online = FALSE WHERE user_id = ?',
        [userId]
      );

      res.json({
        message: 'Аккаунт успешно удален'
      });
    } catch (error) {
      console.error('Delete account error:', error);
      res.status(500).json({ error: 'Ошибка при удалении аккаунта' });
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
        `SELECT user_id, name, surname, nick, avatar_url, cover_url, is_online, last_seen 
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

  // Создание поста
  router.post('/posts', authenticateToken, async (req, res) => {
    console.log('=== СОЗДАНИЕ ПОСТА ===');
    console.log('Body received:', req.body);
    
    try {
      if (!req.body) {
        console.log('ERROR: req.body is undefined');
        return res.status(400).json({ error: 'Тело запроса отсутствует' });
      }

      const { title, content, image_url, video_url, is_public = true } = req.body;
      const userId = req.user.user_id;

      console.log('Parsed data:', { title, content, userId });

      // Валидация
      if (!content || content.trim() === '') {
        return res.status(400).json({ error: 'Содержание поста не может быть пустым' });
      }

      // Создаем пост
      const [result] = await pool.execute(
        `INSERT INTO posts (user_id, title, content, image_url, video_url, is_public) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title || null, content.trim(), image_url || null, video_url || null, is_public]
      );

      console.log('Post created successfully, ID:', result.insertId);

      res.status(201).json({
        message: 'Пост успешно создан',
        postId: result.insertId
      });

    } catch (error) {
      console.error('Create post error:', error);
      console.error('Error stack:', error.stack);
      
      res.status(500).json({ 
        error: 'Ошибка создания поста',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });

  // Получение ленты постов
  router.get('/posts/feed', authenticateToken, async (req, res) => {
    try {
      const userId = req.user.user_id;
      
      // Получаем посты пользователя и его друзей
      const [posts] = await pool.execute(
        `SELECT p.*, 
                u.name, u.surname, u.nick, u.avatar_url, u.cover_url,
                (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id) as likes_count,
                (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count,
                EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.post_id AND user_id = ?) as is_liked
         FROM posts p
         JOIN users u ON p.user_id = u.user_id
         WHERE p.is_published = TRUE 
         AND (p.user_id = ? OR p.user_id IN (
             SELECT user_id2 FROM friendships WHERE user_id1 = ? AND status = 'accepted'
             UNION
             SELECT user_id1 FROM friendships WHERE user_id2 = ? AND status = 'accepted'
         ))
         ORDER BY p.created_at DESC
         LIMIT 50`,
        [userId, userId, userId, userId]
      );

      res.json({ posts });
    } catch (error) {
      console.error('Feed posts error:', error);
      res.status(500).json({ error: 'Ошибка загрузки ленты' });
    }
  });

  // Лайк поста
  router.post('/posts/:postId/like', authenticateToken, async (req, res) => {
    try {
      const { postId } = req.params;
      const userId = req.user.user_id;

      // Проверяем, существует ли пост
      const [posts] = await pool.execute(
        'SELECT post_id FROM posts WHERE post_id = ? AND is_published = TRUE',
        [postId]
      );

      if (posts.length === 0) {
        return res.status(404).json({ error: 'Пост не найден' });
      }

      // Проверяем, не лайкнул ли уже пользователь
      const [existingLikes] = await pool.execute(
        'SELECT like_id FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      if (existingLikes.length > 0) {
        // Удаляем лайк
        await pool.execute(
          'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
          [postId, userId]
        );
        
        // Обновляем счетчик лайков в посте
        await pool.execute(
          'UPDATE posts SET likes_count = likes_count - 1 WHERE post_id = ?',
          [postId]
        );

        res.json({ 
          message: 'Лайк удален',
          liked: false 
        });
      } else {
        // Добавляем лайк
        await pool.execute(
          'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
          [postId, userId]
        );
        
        // Обновляем счетчик лайков в посте
        await pool.execute(
          'UPDATE posts SET likes_count = likes_count + 1 WHERE post_id = ?',
          [postId]
        );

        res.json({ 
          message: 'Пост лайкнут',
          liked: true 
        });
      }
    } catch (error) {
      console.error('Like post error:', error);
      res.status(500).json({ error: 'Ошибка обработки лайка' });
    }
  });

  // Управление друзьями

  // Отправка запроса в друзья
router.post('/friends/request', authenticateToken, async (req, res) => {
    try {
        const { targetUserId } = req.body;
        const userId = req.user.user_id;

        if (userId === targetUserId) {
            return res.status(400).json({ error: 'Нельзя отправить запрос самому себе' });
        }

        // Проверяем существование пользователя
        const [targetUsers] = await pool.execute(
            'SELECT user_id FROM users WHERE user_id = ? AND is_active = TRUE',
            [targetUserId]
        );

        if (targetUsers.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }

        // Проверяем, не отправили ли уже запрос
        const [existingRequests] = await pool.execute(
            `SELECT friendship_id FROM friendships 
             WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)`,
            [userId, targetUserId, targetUserId, userId]
        );

        if (existingRequests.length > 0) {
            return res.status(409).json({ error: 'Запрос в друзья уже отправлен' });
        }

        // Создаем запрос в друзья
        await pool.execute(
            'INSERT INTO friendships (user_id1, user_id2, status, action_user_id) VALUES (?, ?, ?, ?)',
            [userId, targetUserId, 'pending', userId]
        );

        res.json({ message: 'Запрос в друзья отправлен' });
    } catch (error) {
        console.error('Friend request error:', error);
        res.status(500).json({ error: 'Ошибка отправки запроса в друзья' });
    }
});

  // Принятие запроса в друзья
 router.post('/friends/accept', authenticateToken, async (req, res) => {
    try {
        const { friendshipId } = req.body;
        const userId = req.user.user_id;

        // Проверяем, что запрос существует и адресован текущему пользователю
        const [friendships] = await pool.execute(
            'SELECT * FROM friendships WHERE friendship_id = ? AND user_id2 = ? AND status = ?',
            [friendshipId, userId, 'pending']
        );

        if (friendships.length === 0) {
            return res.status(404).json({ error: 'Запрос в друзья не найден' });
        }

        // Принимаем запрос
        await pool.execute(
            'UPDATE friendships SET status = ?, action_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE friendship_id = ?',
            ['accepted', userId, friendshipId]
        );

        res.json({ message: 'Запрос в друзья принят' });
    } catch (error) {
        console.error('Accept friend request error:', error);
        res.status(500).json({ error: 'Ошибка принятия запроса в друзья' });
    }
});

  // Отклонение запроса в друзья
 router.post('/friends/decline', authenticateToken, async (req, res) => {
    try {
        const { friendshipId } = req.body;
        const userId = req.user.user_id;

        const [friendships] = await pool.execute(
            'SELECT * FROM friendships WHERE friendship_id = ? AND user_id2 = ? AND status = ?',
            [friendshipId, userId, 'pending']
        );

        if (friendships.length === 0) {
            return res.status(404).json({ error: 'Запрос в друзья не найден' });
        }

        // Отклоняем запрос
        await pool.execute(
            'UPDATE friendships SET status = ?, action_user_id = ?, updated_at = CURRENT_TIMESTAMP WHERE friendship_id = ?',
            ['rejected', userId, friendshipId]
        );

        res.json({ message: 'Запрос в друзья отклонен' });
    } catch (error) {
        console.error('Decline friend request error:', error);
        res.status(500).json({ error: 'Ошибка отклонения запроса в друзья' });
    }
});

// Добавление поста в избранное
router.post('/posts/:postId/favorite', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.user_id;

        // Проверяем, существует ли пост
        const [posts] = await pool.execute(
            'SELECT post_id FROM posts WHERE post_id = ? AND is_published = TRUE',
            [postId]
        );

        if (posts.length === 0) {
            return res.status(404).json({ error: 'Пост не найден' });
        }

        // Проверяем, не добавлен ли уже в избранное
        const [existingFavorites] = await pool.execute(
            'SELECT favorite_id FROM user_favorites WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (existingFavorites.length > 0) {
            return res.status(409).json({ error: 'Пост уже в избранном' });
        }

        // Добавляем в избранное
        await pool.execute(
            'INSERT INTO user_favorites (user_id, post_id) VALUES (?, ?)',
            [userId, postId]
        );

        res.json({ 
            message: 'Пост добавлен в избранное',
            favorited: true 
        });
    } catch (error) {
        console.error('Add to favorites error:', error);
        res.status(500).json({ error: 'Ошибка добавления в избранное' });
    }
});

// Удаление поста из избранного
router.delete('/posts/:postId/favorite', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.user_id;

        const [result] = await pool.execute(
            'DELETE FROM user_favorites WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Пост не найден в избранном' });
        }

        res.json({ 
            message: 'Пост удален из избранного',
            favorited: false 
        });
    } catch (error) {
        console.error('Remove from favorites error:', error);
        res.status(500).json({ error: 'Ошибка удаления из избранного' });
    }
});

// Получение конкретного поста по ID
router.get('/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.user_id;

    const [posts] = await pool.execute(
      `SELECT p.*, 
              u.name, u.surname, u.nick, u.avatar_url, u.cover_url,
              (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id) as likes_count,
              (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count,
              EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.post_id AND user_id = ?) as is_liked
       FROM posts p
       JOIN users u ON p.user_id = u.user_id
       WHERE p.post_id = ? AND p.is_published = TRUE`,
      [userId, postId]
    );

    if (posts.length === 0) {
      return res.status(404).json({ error: 'Пост не найден' });
    }

    res.json({ post: posts[0] });
  } catch (error) {
    console.error('Get post error:', error);
    res.status(500).json({ error: 'Ошибка загрузки поста' });
  }
});

// Проверка, добавлен ли пост в избранное
router.get('/posts/:postId/favorite/check', authenticateToken, async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.user_id;

        const [favorites] = await pool.execute(
            'SELECT favorite_id FROM user_favorites WHERE post_id = ? AND user_id = ?',
            [postId, userId]
        );

        res.json({ 
            isFavorite: favorites.length > 0
        });
    } catch (error) {
        console.error('Check favorite error:', error);
        res.status(500).json({ error: 'Ошибка проверки избранного' });
    }
});

// Получение избранных постов пользователя
router.get('/favorites/posts', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [favorites] = await pool.execute(
            `SELECT p.*, 
                    u.name, u.surname, u.nick, u.avatar_url, u.cover_url,
                    (SELECT COUNT(*) FROM post_likes WHERE post_id = p.post_id) as likes_count,
                    (SELECT COUNT(*) FROM comments WHERE post_id = p.post_id) as comments_count,
                    EXISTS(SELECT 1 FROM post_likes WHERE post_id = p.post_id AND user_id = ?) as is_liked,
                    uf.created_at as favorited_at
             FROM user_favorites uf
             JOIN posts p ON uf.post_id = p.post_id
             JOIN users u ON p.user_id = u.user_id
             WHERE uf.user_id = ? AND p.is_published = TRUE
             ORDER BY uf.created_at DESC`,
            [userId, userId]
        );

        res.json({ favorites });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({ error: 'Ошибка загрузки избранных постов' });
    }
});


  // Удаление из друзей
  router.delete('/friends/remove', authenticateToken, async (req, res) => {
    try {
        const { friendId } = req.body;
        const userId = req.user.user_id;

        // Удаляем дружбу
        const [result] = await pool.execute(
            `DELETE FROM friendships 
             WHERE ((user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2 = ?)) 
             AND status = ?`,
            [userId, friendId, friendId, userId, 'accepted']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Друг не найден' });
        }

        res.json({ message: 'Пользователь удален из друзей' });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({ error: 'Ошибка удаления из друзей' });
    }
});

  // Получение списка друзей
  router.get('/friends', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [friends] = await pool.execute(
            `SELECT u.user_id, u.name, u.surname, u.nick, u.avatar_url, u.cover_url, 
                    u.is_online, u.last_seen
             FROM users u
             WHERE u.user_id IN (
                 SELECT user_id2 FROM friendships WHERE user_id1 = ? AND status = 'accepted'
                 UNION
                 SELECT user_id1 FROM friendships WHERE user_id2 = ? AND status = 'accepted'
             )
             ORDER BY u.is_online DESC, u.name ASC`,
            [userId, userId]
        );

        res.json({ friends });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({ error: 'Ошибка загрузки списка друзей' });
    }
});

  // Получение входящих запросов в друзья
  router.get('/friends/requests', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.user_id;

        const [requests] = await pool.execute(
            `SELECT f.friendship_id, u.user_id, u.name, u.surname, u.nick, 
                    u.avatar_url, u.cover_url,
                    (SELECT COUNT(*) FROM friendships f2 
                     WHERE ((f2.user_id1 = u.user_id AND f2.user_id2 IN (
                         SELECT user_id2 FROM friendships WHERE user_id1 = ? AND status = 'accepted'
                         UNION 
                         SELECT user_id1 FROM friendships WHERE user_id2 = ? AND status = 'accepted'
                     )) OR (f2.user_id2 = u.user_id AND f2.user_id1 IN (
                         SELECT user_id2 FROM friendships WHERE user_id1 = ? AND status = 'accepted'
                         UNION 
                         SELECT user_id1 FROM friendships WHERE user_id2 = ? AND status = 'accepted'
                     ))) AND f2.status = 'accepted') as mutual_friends
             FROM friendships f
             JOIN users u ON f.user_id1 = u.user_id
             WHERE f.user_id2 = ? AND f.status = 'pending'
             ORDER BY f.created_at DESC`,
            [userId, userId, userId, userId, userId]
        );

        res.json({ requests });
    } catch (error) {
        console.error('Get friend requests error:', error);
        res.status(500).json({ error: 'Ошибка загрузки запросов в друзья' });
    }
});

  return router;
};

module.exports = userRoutes;