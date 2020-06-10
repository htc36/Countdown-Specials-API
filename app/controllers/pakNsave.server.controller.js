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

