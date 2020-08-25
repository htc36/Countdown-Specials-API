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

exports.getConnectedProductHistory = async function(location, code) {
    // const q = "SELECT psProducts.productId, psProducts.name, psProducts.quantityType, psPrices.price FROM psProducts " +
    //     "JOIN psPrices ON psProducts.productId = psPrices.productId JOIN linkedSupermarkets on psProducts.productId " +
    //     "= pakNsaveID JOIN cdPrices ON countdownID = code AND psPrices.store = '" + location + "' AND code = '" + code +
    //     "' AND psPrices.date = cdPrices.date"
    const q = "SELECT psProducts.productId, psProducts.name, psProducts.quantityType, psPrices.price, psPrices.date FROM psProducts " +
        "JOIN psPrices ON psProducts.productId = psPrices.productId JOIN linkedSupermarkets on psProducts.productId " +
        "= pakNsaveID JOIN cdPrices ON countdownID = code AND psPrices.store = '" + location + "' AND code = '" + code +
        "' AND psPrices.date = cdPrices.date"
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [row2, fields2] = await connection.query(q);
    connection.release();
    return row2;
};
