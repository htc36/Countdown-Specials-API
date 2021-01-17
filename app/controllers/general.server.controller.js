const general = require('../models/general.server.model');

exports.getStoresDropdown = async function(req, res) {
    let result = await general.getConnectedStores();
    let response = []
    for (store of result) {
        response.push({"name": store["displayName"], "value": {"countdown": store["cdStore"], "paknsave" : store["psStore"]}})
    }
    res.status(200)
        .send(response);
}
exports.getProductAllStores = async function(req, res) {
    const productCode = req.query.productCode;
    const store = req.query.store;
    const date = req.query.date;
    let result = await general.getProductAllStores(productCode, date, store);
    res.status(200)
        .send(result);
}


