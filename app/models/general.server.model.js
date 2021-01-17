const db = require('../../config/db');

async function getConnection() {
    let connection = await db.getPool().getConnection();
    connection.changeUser({database : "specials4"});
    return connection
}

exports.getConnectedStores = async function() {
    let connection = await getConnection()
    let query = "SELECT cs.storeCode as cdStore, cs.displayName as displayName, cs.psStore as psStore FROM countdownStores cs left join psStores ps on cs.storeCode = ps.cdStore where cs.displayName != ''"
    const [rows, fields] = await connection.query(query);
    connection.release();
    return rows;
};
exports.getProductAllStores = async function(productCode, date, store) {
    let connection = await getConnection()
    let query
    if (store == 'countdown') {
        query = "SELECT cs.storeName as cdStoreName, cs.lat as cdLat, cs.lng as cdLng, cdPrices.date as csDate, cdPrices.salePrice as cdPrice, psStores.storeName as psStoreName, psStores.lat as psLat, psStores.lng as psLng, psPrices.date as psDate, psPrices.price as psPrice \
        FROM cdPrices \
        JOIN cdProducts ON cdPrices.code = cdProducts.code and cdProducts.code = ? and cdPrices.storeCode != 0 and cdPrices.date = ?\
        JOIN countdownStores cs ON cdPrices.storeCode = cs.storeCode \
        LEFT JOIN linkedSupermarkets ls ON cdPrices.code = ls.countdownID \
        LEFT JOIN psPrices on cs.psStore = psPrices.store AND psPrices.productId = ls.pakNsaveID and psPrices.date = ? \
        left JOIN psStores on cs.psStore = psStores.storeCode"
    } else {
        query = "SELECT cs.storeName as cdStoreName, cs.lat as cdLat, cs.lng as cdLng, cdPrices.date as csDate, cdPrices.salePrice as cdPrice, ps.storeName as psStoreName, ps.lat as psLat, ps.lng as psLng, psPrices.date as psDate, psPrices.price as psPrice \
        FROM psPrices \
        JOIN psProducts ON psPrices.productId = psProducts.productId and psProducts.productId = ? and psPrices.date = ? \
        JOIN psStores ps ON psPrices.store = ps.storeCode \
        LEFT JOIN linkedSupermarkets ls ON psPrices.productId = ls.paknsaveID \
        LEFT JOIN cdPrices on ps.cdStore = cdPrices.storeCode AND cdPrices.code = ls.countdownID and cdPrices.date = ? \
        left JOIN countdownStores cs on ps.cdStore = cs.storeCode"
    }

    const [rows, fields] = await connection.query(query, [productCode, date, date],);
    connection.release();
    return rows;
};


