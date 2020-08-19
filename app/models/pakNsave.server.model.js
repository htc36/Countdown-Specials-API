const db = require('../../config/db');

exports.getAll = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "pakNsave"});
    const [rows, fields] = await connection.query(query);
    connection.release();
    return rows;
};

exports.getSingleUnJoinedProduct = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "pakNsave"});
    const [rows, fields] = await connection.query(query);
    connection.release();
    return rows;
};
