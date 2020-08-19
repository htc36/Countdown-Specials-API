const mysql = require('mysql2/promise');
require('dotenv').config();

let state = {
    pool: null
};

exports.connect = async function() {
    state.pool = await mysql.createPool({
        host: process.env.HOST,
        user: "root",
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        // port: process.env.PORT,
    });
    await state.pool.getConnection();
    console.log('Successfully connected to the database');
}

exports.getPool = function() {
    return state.pool;
};
