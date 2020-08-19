const pakNsave = require('../models/pakNsave.server.model');

exports.test = async function(req, res) {
    try {
        const result = await pakNsave.getAll();
        res.status(200)
            .json({
                total : 5,
                rows : result
            });
    } catch (err) {
        res.status(500)
            .send(`ERROR getting convos ${err}`);
    }
}
exports.getSingleProduct = async function(req, res) {
    const cat1 = req.query.cat1;
    const cat2 = req.query.cat2;
    let offset = req.query.offset;
    if (offset == null) {
        offset = 0
    }
    const query = "select * from distinctProducts where distinctProducts.productId NOT IN (SELECT pakNsaveID " +
        "from linkedSupermarkets WHERE linkedSupermarkets.pakNsaveID = productId) " +
        "AND category1 = '" + cat1 + "' AND category2 = '" + cat2 + "' LIMIT 1 OFFSET " + offset

    try {
        const result = await pakNsave.getSingleUnJoinedProduct(query);
        res.status(200)
            .send(
                result
            );
    } catch (err) {
        res.status(500)
            .send(`ERROR getting convos ${err}`);
    }
}

