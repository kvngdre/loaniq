const { createLogger, format, transports, loggers } = require('winston');
const { combine, align, timestamp, printf } = format;

const Logger = createLogger({
    transports: [
        new transports.File({
            level: 'info',
            filename: 'logs/info.log',
            format: combine(
                timestamp({
                    format: 'DD-MM-YYYY HH:mm:ss',
                }),
                align(),
                printf(({ level, label, timestamp, message, meta }) => {
                    return `[${level}]:[${label}] ${timestamp} ${message} -- ${
                        meta ? JSON.stringify(meta) : ''
                    }`;
                })
            ),
            json: true,
        }),

        new transports.File({
            level: 'error',
            filename: 'logs/error.log',
            format: combine(
                timestamp({
                    format: 'DD-MM-YYYY HH:mm:ss',
                }),
                align(),
                printf(({ level, label, timestamp, message, meta }) => {
                    return `[${level}]:[${label}] ${timestamp} ${message} -- ${
                        meta ? JSON.stringify(meta) : ''
                    }`;
                })
            ),
            // handleExceptions: true,
            json: true,
        }),
    ],
});

module.exports = function (filename) {
    return Logger.child({ label: filename });
};
