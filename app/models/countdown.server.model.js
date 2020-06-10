const db = require('../../config/db');

exports.getAll = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials"});
    const [rows, fields] = await connection.query("SELECT * " + query);
    connection.release();
    return rows;
};
exports.getCount = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials"});
    const [rows, fields] = await connection.query("SELECT COUNT(*) AS Total " + query);
    connection.release();
    return rows[0].Total;
};
exports.getDateData = async function() {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials"});
    const q = "SELECT STR_TO_DATE(table_name, '%d/%m/%Y') as test, table_name FROM \
        information_schema.tables WHERE table_schema = 'specials' order by test DESC"
    const [rows, fields] = await connection.query(q);
    connection.release();
    return rows;
};
exports.getTypes = async function() {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials"});
    const q = "select distinct type FROM `20/01/20`"
    const [rows, fields] = await connection.query(q);
    connection.release();
    return rows;
};
