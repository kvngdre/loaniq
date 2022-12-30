const cookieParser = require('cookie-parser');
const cors = require('cors');
const corsOptions = require('../config/corsOptions');
const credentials = require('../middleware/credentials');
const express = require('express');
const helmet = require('helmet');

module.exports = app => {
    app.use(credentials);
    app.use(cors(corsOptions));
    app.use(helmet());
    app.use(express.urlencoded({ extended: false }));
    app.use(express.json());
    app.use(cookieParser());
}