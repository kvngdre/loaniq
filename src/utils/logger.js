import { addColors, createLogger, format, transports } from "winston";

const { align, colorize, combine, timestamp, printf } = format;

function isDevEnvironment() {
  return process.env.NODE_ENV === "development";
}

const custom = {
  colors: {
    fatal: "red",
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    debug: "cyan",
  },
  levels: { fatal: 0, error: 1, warn: 2, info: 3, http: 4, debug: 5 },
};

const devFormatter = combine(
  colorize(),
  timestamp({ format: "HH:mm:ss" }),
  printf(({ level, timestamp, message, meta }) => {
    const msg = message.replace("undefined", "");
    return `[${level}] ${timestamp} ${msg}  ${
      meta ? JSON.stringify(meta, null, 2) : ""
    }`;
  }),
);

const prodFormatter = combine(
  align(),
  timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  printf(
    ({ level, timestamp, message, meta }) =>
      `[${level}]${timestamp} ${message}  ${
        meta ? JSON.stringify(meta, null, 2) : ""
      }`,
  ),
);

class Logger {
  constructor() {
    const devTransport = new transports.Console({
      format: devFormatter,
    });

    const prodTransport = new transports.File({
      level: "error",
      filename: "logs/error.log",
      format: prodFormatter,
      handleExceptions: true,
      json: true,
    });

    this.logger = createLogger({
      level: isDevEnvironment() ? "debug" : "error",
      levels: custom.levels,
      transports: [isDevEnvironment() ? devTransport : prodTransport],
    });

    addColors(custom.colors);
  }

  fatal(message, meta) {
    this.logger.log("fatal", { message, meta });
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

  http(message, meta) {
    this.logger.http({ message, meta });
  }

  debug(message, meta) {
    this.logger.debug({ message, meta });
  }
}

export const logger = new Logger();
