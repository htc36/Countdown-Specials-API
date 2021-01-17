const general = require('../controllers/general.server.controller');
module.exports = function(app) {
    app.route('/api/general/getStoresDropdown')
        .get(general.getStoresDropdown)
    app.route('/api/general/getProductAllStores')
        .get(general.getProductAllStores)
}

