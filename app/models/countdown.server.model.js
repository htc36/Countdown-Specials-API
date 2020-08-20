const db = require('../../config/db');

exports.getAll = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [rows, fields] = await connection.query("SELECT * " + query);
    connection.release();
    return rows;
};
exports.getCount = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [rows, fields] = await connection.query("SELECT COUNT(*) AS Total " + query);
    connection.release();
    return rows[0].Total;
};
exports.getDateData = async function() {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const q = "SELECT STR_TO_DATE(table_name, '%d/%m/%Y') as test, table_name FROM \
        information_schema.tables WHERE table_schema = 'specials' order by test DESC"
    const [rows, fields] = await connection.query(q);
    connection.release();
    return rows;
};
exports.getTypes = async function(query) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [rows, fields] = await connection.query(query);
    connection.release();
    return rows;
};
exports.getProductsHistory = async function(barcode) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const q = "SELECT date, salePrice FROM cdProducts JOIN cdPrices ON cdProducts.barcode = cdPrices.barcode AND cdPrices.barcode =" + barcode
    const [rows, fields] = await connection.query(q);
    connection.release();
    return rows;
};
