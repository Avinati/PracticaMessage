const express = require('express');

const chatRoutes = (pool, authenticateToken) => {
  const router = express.Router();

  router.get('/', authenticateToken, async (req, res) => {
    try {
      const [chats] = await pool.execute(
        `SELECT 
          c.chat_id,
          c.chat_type,
          c.chat_name,
          c.last_activity,
          c.created_at,
          COUNT(DISTINCT cp.user_id) as participants_count,
          (SELECT content FROM messages m WHERE m.chat_id = c.chat_id ORDER BY m.created_at DESC LIMIT 1) as last_message,
          (SELECT created_at FROM messages m WHERE m.chat_id = c.chat_id ORDER BY m.created_at DESC LIMIT 1) as last_message_time,
          (SELECT COUNT(*) FROM messages m WHERE m.chat_id = c.chat_id AND m.is_read = FALSE AND m.user_id != ?) as unread_count
         FROM chats c
         JOIN chat_participants cp ON c.chat_id = cp.chat_id
         WHERE cp.user_id = ?
         GROUP BY c.chat_id
         ORDER BY c.last_activity DESC`,
        [req.user.user_id, req.user.user_id]
      );

      for (let chat of chats) {
        const [participants] = await pool.execute(
          `SELECT 
            u.user_id, u.name, u.surname, u.nick, u.avatar_url, u.is_online, u.last_seen
           FROM chat_participants cp
           JOIN users u ON cp.user_id = u.user_id
           WHERE cp.chat_id = ? AND u.user_id != ?`,
          [chat.chat_id, req.user.user_id]
        );
        chat.participants = participants;
      }

      res.json({ chats });
    } catch (error) {
      console.error('Ошибка получения чатов:', error);
      res.status(500).json({ error: 'Ошибка при получении списка чатов' });
    }
  });

  router.post('/', authenticateToken, async (req, res) => {
    try {
      const { participant_ids, chat_name = null } = req.body;

      if (!participant_ids || !Array.isArray(participant_ids) || participant_ids.length === 0) {
        return res.status(400).json({ error: 'Укажите участников чата' });
      }

      const placeholders = participant_ids.map(() => '?').join(',');
      const [users] = await pool.execute(
        `SELECT user_id FROM users WHERE user_id IN (${placeholders})`,
        participant_ids
      );

      if (users.length !== participant_ids.length) {
        return res.status(404).json({ error: 'Один или несколько пользователей не найдены' });
      }

      if (participant_ids.length === 1) {
        const [existingChats] = await pool.execute(
          `SELECT c.chat_id 
           FROM chats c
           JOIN chat_participants cp1 ON c.chat_id = cp1.chat_id
           JOIN chat_participants cp2 ON c.chat_id = cp2.chat_id
           WHERE c.chat_type = 'private' 
           AND cp1.user_id = ? 
           AND cp2.user_id = ?`,
          [req.user.user_id, participant_ids[0]]
        );

        if (existingChats.length > 0) {
          return res.status(409).json({ 
            error: 'Чат с этим пользователем уже существует',
            chat_id: existingChats[0].chat_id 
          });
        }
      }

      const [chatResult] = await pool.execute(
        'INSERT INTO chats (chat_type, chat_name, created_by) VALUES (?, ?, ?)',
        [participant_ids.length === 1 ? 'private' : 'group', chat_name, req.user.user_id]
      );

      const chatId = chatResult.insertId;

      const participants = [req.user.user_id, ...participant_ids];
      const participantValues = participants.map(userId => [chatId, userId, userId === req.user.user_id]);
      
      for (const [chatId, userId, isAdmin] of participantValues) {
        await pool.execute(
          'INSERT INTO chat_participants (chat_id, user_id, is_admin) VALUES (?, ?, ?)',
          [chatId, userId, isAdmin]
        );
      }

      const [newChat] = await pool.execute(
        `SELECT 
          c.chat_id,
          c.chat_type,
          c.chat_name,
          c.last_activity,
          c.created_at
         FROM chats c
         WHERE c.chat_id = ?`,
        [chatId]
      );

      const [participantsData] = await pool.execute(
        `SELECT 
          u.user_id, u.name, u.surname, u.nick, u.avatar_url, u.is_online
         FROM chat_participants cp
         JOIN users u ON cp.user_id = u.user_id
         WHERE cp.chat_id = ? AND u.user_id != ?`,
        [chatId, req.user.user_id]
      );

      const chat = {
        ...newChat[0],
        participants: participantsData,
        participants_count: participants.length,
        last_message: null,
        last_message_time: null,
        unread_count: 0
      };

      res.status(201).json({
        message: 'Чат создан успешно',
        chat
      });

    } catch (error) {
      console.error('Ошибка создания чата:', error);
      res.status(500).json({ error: 'Ошибка при создании чата' });
    }
  });

  

router.get('/:chatId/messages', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 100 } = req.query;
    
    const chatIdNum = parseInt(chatId, 10);
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    const [messages] = await pool.execute(
      `SELECT 
        m.message_id,
        m.chat_id,
        m.user_id,
        m.content,
        m.message_type,
        m.attachment_url,
        m.is_read,
        m.read_at,
        m.is_edited,
        m.created_at,
        m.updated_at,
        u.name,
        u.surname,
        u.nick,
        u.avatar_url
       FROM messages m
       JOIN users u ON m.user_id = u.user_id
       WHERE m.chat_id = ?
       ORDER BY m.created_at ASC 
       LIMIT ${limitNum} OFFSET ${(pageNum - 1) * limitNum}`,
      [chatIdNum]
    );

    res.json({
      messages: messages,
      pagination: {
        page: pageNum,
        limit: limitNum,
        hasMore: messages.length === limitNum
      }
    });

  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    res.status(500).json({ error: 'Ошибка при получении сообщений' });
  }
});

  router.get('/:chatId', authenticateToken, async (req, res) => {
    try {
      const { chatId } = req.params;

      const [chats] = await pool.execute(
        `SELECT 
          c.chat_id,
          c.chat_type,
          c.chat_name,
          c.last_activity,
          c.created_at
         FROM chats c
         JOIN chat_participants cp ON c.chat_id = cp.chat_id
         WHERE c.chat_id = ? AND cp.user_id = ?`,
        [chatId, req.user.user_id]
      );

      if (chats.length === 0) {
        return res.status(404).json({ error: 'Чат не найден' });
      }

      const chat = chats[0];

      const [participants] = await pool.execute(
        `SELECT 
          u.user_id, u.name, u.surname, u.nick, u.avatar_url, u.is_online, u.last_seen
         FROM chat_participants cp
         JOIN users u ON cp.user_id = u.user_id
         WHERE cp.chat_id = ?`,
        [chatId]
      );

      chat.participants = participants;

      res.json({ chat });

    } catch (error) {
      console.error('Ошибка получения информации о чате:', error);
      res.status(500).json({ error: 'Ошибка при получении информации о чате' });
    }
  });

  return router;
};

module.exports = chatRoutes;