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
    const q = "SELECT psProducts.quantityType, psProducts.name as pakName, psPrices.price, psPrices.date as date2, psProducts.productId," +
        " cdProducts.name, cdProducts.brand, cdProducts.volSize, cdPrices.salePrice, cdPrices.date, cdPrices.origPrice" +
        " FROM cdProducts JOIN cdPrices ON cdProducts.code = cdPrices.code" +
        " AND cdProducts.code = '" + code + "' JOIN linkedSupermarkets on cdPrices.code = linkedSupermarkets.countdownID LEFT JOIN" +
        " psPrices ON linkedSupermarkets.pakNsaveID = psPrices.productId AND psPrices.date = cdPrices.date AND psPrices.store" +
        " = '" + location + "' LEFT JOIN psProducts ON psPrices.productId = psProducts.productId" +
        " UNION" +
        " SELECT psProducts.quantityType, psProducts.name, psPrices.price, psPrices.date, psProducts.productId," +
        " cdProducts.name, cdProducts.brand, cdProducts.volSize, cdPrices.salePrice, cdPrices.date, cdPrices.origPrice" +
        " FROM psProducts JOIN psPrices ON psPrices.productId = psProducts.productId JOIN linkedSupermarkets on" +
        " psProducts.productId = linkedSupermarkets.pakNsaveID JOIN cdProducts ON linkedSupermarkets.countdownID = cdProducts.code" +
        " AND cdProducts.code = '" + code + "' AND psPrices.store = '" + location + "' LEFT JOIN cdPrices ON cdProducts.code = cdPrices.code AND" +
    " cdPrices.date = psPrices.date ORDER BY COALESCE(date, date2)"
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [row2, fields2] = await connection.query(q);
    connection.release();
    return row2;
};
