const express = require('express');
const app = express();
const dotenv = require('dotenv');
dotenv.config();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt'); 
const port = process.env.PORT || 5000; 


const { pool, checkConnection } = require('./db');

app.use(express.json());

app.get('/', (req, res) => {
    res.json({ message: 'Рабочий сервер' });
});

app.listen(port, async () => {
    console.log('🚀 Сервер запущен на порту: ' + port);
    await checkConnection(); 
});