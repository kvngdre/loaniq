import mongoose from "mongoose";

import { logger } from "../utils/index.js";
import { tenantSchema, tokensSchema, userSchema } from "./models/index.js";

class DBContext {
  #_db;

  constructor() {
    /** @type {typeof mongoose} */
    this.#_db = null;
  }

  async connect() {
    try {
      // mongoose.set("strictQuery", true);

      this.#_db = await mongoose.connect(process.env.DB_URI_REMOTE);
      logger.info("Connected to database");
    } catch (error) {
      logger.error("Failed to connect to database", error);
      process.exit(1);
    }
  }

  async disconnect() {
    await mongoose.disconnect();
  }

  get Tenant() {
    return mongoose.model("Tenant", tenantSchema);
  }

  get User() {
    return mongoose.model("User", userSchema);
  }

  get Token() {
    return mongoose.model("Token", tokensSchema);
  }
}

export default new DBContext();
