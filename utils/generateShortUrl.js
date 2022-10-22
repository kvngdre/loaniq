const shortId = require('shortid');
const debug = require('debug')('app:generateShortId');
const Lender = require('../models/lenderModel');
const logger = require('../utils/logger')('generateShortUrl.js');

async function generateShortUrl() {
    try {
        const shortUrl = shortId.generate().substring(1, 8);
        const foundShortUrl = await Lender.findOne({ publicUrl: shortUrl });
        if (foundShortUrl) {
            generateShortUrl();
        } else {
            return  shortUrl;
        }
    } catch (exception) {
        logger.error({
            method: 'generate_short_url',
            message: exception.message,
            meta: exception.stack,
        });
        debug(exception);
        return exception;
    }
}

module.exports = generateShortUrl;
