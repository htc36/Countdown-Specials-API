const convo = require('../controllers/pakNsave.server.controller');


module.exports = function(app) {
    app.route('/api/convo')
        .get(convo.test)
    app.route('/getProduct')
        .get(convo.getSingleProduct)
    app.route('/linkProducts')
        .post(convo.linkProducts)
};
