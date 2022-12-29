const mongoose = require('mongoose');

module.exports = function (req, res, next) {
    for (const param in req.params) {
        if (
            req.params[param] &&
            !mongoose.Types.ObjectId.isValid(req.params[param])
        )
            return res.status(400).send(`Invalid ${param}`);
    }

    next();
};
