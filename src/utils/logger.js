import { addColors, format, createLogger, transports } from 'winston';
const { align, cli, colorize, combine, timestamp, printf } = format;

function isDevEnvironment() {
  if (process.env.NODE_ENV === 'development') return true;

  return false;
}

const custom = {
  colors: {
    fatal: 'red',
    error: 'red',
    warn: 'yellow',
    info: 'green',
    debug: 'cyan',
    silly: 'magenta',
  },
  levels: { fatal: 0, error: 1, warn: 2, info: 3, debug: 4, silly: 5 },
};

const devFormatter = combine(
  cli(),
  colorize(),
  timestamp({ format: 'HH:mm:ss' }),
  printf(({ level, timestamp, message, meta }) => {
    message = message.replace('undefined', '');
    return `[${level}] ${timestamp} ${message}  ${
      meta ? JSON.stringify(meta, null, 2) : ''
    }`;
  }),
);

const prodFormatter = combine(
  align(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ level, timestamp, message, meta }) => {
    return `[${level}]${timestamp} ${message}  ${
      meta ? JSON.stringify(meta, null, 2) : ''
    }`;
  }),
);

class Logger {
  constructor() {
    const devTransport = new transports.Console({
      format: devFormatter,
    });

    const prodTransport = new transports.File({
      level: 'error',
      filename: 'src/logs/error.log',
      format: prodFormatter,
      handleExceptions: true,
      json: true,
    });

    this.logger = createLogger({
      level: isDevEnvironment() ? 'silly' : 'error',
      levels: custom.levels,
      transports: [isDevEnvironment() ? devTransport : prodTransport],
    });

    addColors(custom.colors);
  }

  fatal(message, meta) {
    this.logger.log('fatal', { message, meta });
  }

  error(message, meta) {
    this.logger.error({ message, meta });
  }

  warn(message, meta) {
    this.logger.warn({ message, meta });
  }

  info(message, meta) {
    this.logger.info({ message, meta });
  }

  debug(message, meta) {
    this.logger.debug({ message, meta });
  }

  silly(message, meta) {
    this.logger.silly({ message, meta });
  }
}

export default new Logger();
