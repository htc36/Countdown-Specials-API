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

exports.getProductsHistory = async function(code, store) {
    const q = "SELECT psProducts.name, psProducts.quantityType, psPrices.price, psPrices.date FROM psProducts JOIN " +
        "psPrices ON psProducts.productId = psPrices.productId AND psPrices.productId = '" + code + "' AND " +
        "psPrices.store = '" + store + "'"
    let connection = await db.getPool().getConnection();
    connection.changeUser({database: "specials4"});
    const [row2, fields2] = await connection.query(q);
    connection.release();
    return row2;
};

exports.getConnectedProductHistoryPaknSave = async function(location, code) {
    const q = "SELECT psProducts.quantityType, psProducts.name, psPrices.price, psPrices.date, cdProducts.name, cdProducts.brand, cdProducts.volSize," +
        " cdPrices.salePrice, cdPrices.date as date2 FROM psProducts JOIN psPrices ON psProducts.productId = psPrices.productId AND psProducts.productId" +
        " = '" + code + "' JOIN linkedSupermarkets on psPrices.productId = linkedSupermarkets. pakNsaveID AND psPrices.store = '" + location + "' LEFT JOIN " +
        "cdPrices ON linkedSupermarkets.countdownID = cdPrices.code AND cdPrices.date = psPrices.date LEFT JOIN cdProducts ON cdPrices.code = cdProducts.code " +
        "UNION " +
        "SELECT psProducts.quantityType, psProducts.name, psPrices.price, psPrices.date, cdProducts.name, cdProducts.brand, cdProducts.volSize, " +
        "cdPrices.salePrice, cdPrices.date FROM cdProducts JOIN cdPrices ON cdPrices.code = cdProducts.code JOIN linkedSupermarkets on cdProducts.code = " +
        "linkedSupermarkets.countdownID JOIN psProducts ON linkedSupermarkets.pakNsaveID = psProducts.productId AND psProducts.productId = '" + code + "'" +
        " LEFT JOIN psPrices ON psProducts.productId = psPrices.productId AND cdPrices.date = psPrices.date AND psPrices.store = '" + location + "' " +
        "ORDER BY COALESCE(date, date2)"
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    const [row2, fields2] = await connection.query(q);
    connection.release();
    return row2;
};


