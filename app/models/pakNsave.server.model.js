const db = require('../../config/db');

exports.getAll = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [rows, fields] = await connection.query(query);
    connection.release();
    return rows;
};

exports.getSingleUnJoinedProduct = async function(query, offset) {
    const countQuery = "SELECT COUNT(*) " + query
    query ="SELECT * " + query + " LIMIT 1 OFFSET " + offset
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [rows, fields] = await connection.query(query);
    const [row2, fields2] = await connection.query(countQuery);
    connection.release();
    return [rows, row2];
};
