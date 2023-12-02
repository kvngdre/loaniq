import mongoose from "mongoose";

import config from "../config/index.js";

const { error, log } = console;

export default () => {
  try {
    const databaseUri = config.db.uri.dev_atlas;
    mongoose.connect(databaseUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    log("Connected to database");
  } catch (err) {
    error(`Failure to connect to database: ${err}`);
    throw err;
  }
};
