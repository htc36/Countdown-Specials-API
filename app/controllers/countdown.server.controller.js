const countdown = require('../models/countdown.server.model');

exports.getProducts = async function(req, res) {
    let hit = false;
    let queryWithOffset = "";
    const type = req.query.type;
    const name = req.query.dateOfSpecials;
    const search = req.query.search;
    const order = req.query.order;
    const offset = req.query.offset;
    const limit = req.query.limit;
    const sort = req.query.sort;
    let query = "FROM `" + name + "` WHERE";
    if (type != 'All' &&  type != null){
        query += " type = '" + type + "'";
        hit = true;
    }
    if (search != null && search.length != 0){
        query += hit ? " AND " : ""
        query += " name LIKE '%" + search + "%'";
        hit = true
    }
    if (!hit) {
        query = "FROM `" + name  + "`";
    }
    if (sort != null) {
        query += " ORDER BY " +sort;
        query += order ? ' desc' : "";
    }
    if (parseInt(limit) <= 100 ){
        query += " LIMIT " + limit;
    }
    if (offset != null) {
        queryWithOffset = query + " OFFSET " + offset;
    }
    try {
        let result
        if (queryWithOffset != ""){
            result = await countdown.getAll(queryWithOffset);
        }else {
            result = await countdown.getAll(query);
        }
        const total = await countdown.getCount(query);
        res.status(200)
            .json({
                total: total,
                rows : result
            });

    } catch (err) {
        res.status(500)
            .send(`ERROR getting data ${err}`);
    }
}
exports.getDates = async function(req, res) {
    try {
        const dates = await countdown.getDateData();
        res.status(200)
            .send({
                dates
            });

    } catch (err) {
        res.status(500)
            .send(`ERROR getting data ${err}`);
    }
}
exports.getTypes = async function(req, res) {
    try {
        const types = await countdown.getTypes();
        res.status(200)
            .send({
                types
            });

    } catch (err) {
        res.status(500)
            .send(`ERROR getting data ${err}`);
    }
}

