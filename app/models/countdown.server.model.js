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
exports.getProductsHistory = async function(code) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const q = "SELECT date, salePrice FROM cdProducts JOIN cdPrices ON cdProducts.code = cdPrices.code AND cdPrices.code =" + code
    const [rows, fields] = await connection.query(q);
    connection.release();
    return rows;
};
exports.getProductsThatAreNotLinked = async function(selection, date, cat1) {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});

    let query3 = " from cdProducts i INNER JOIN cdPrices p ON i.code = p.code AND p.date > '" + date + "' AND i.type" +
        " = '" + cat1 + "' AND i.code LEFT OUTER JOIN linkedSupermarkets l ON i.code = l.countdownID WHERE " +
        "l.countdownID is null ORDER BY RAND() LIMIT 1 "
    console.log(selection)

    const [rows, fields] = await connection.query(selection + query3);
    connection.release();
    return rows;
};
