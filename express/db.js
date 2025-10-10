const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_NAME || 'AppMessageSun',
    waitForConnections: true, 
    connectionLimit: 10
};

const pool = mysql.createPool(dbConfig);

const checkConnection = async () => {
    try {
        const connection = await pool.getConnection();
        const [rows] = await connection.execute('SELECT 1 AS result'); 
        connection.release(); 
        console.log('✅ База данных подключена успешно');
        return true;
    } catch (error) {
        console.log('❌ Ошибка подключения к базе данных:', error.message);
        return false;
    }
}


module.exports = {
    pool,
    checkConnection
};