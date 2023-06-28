/* eslint-disable no-underscore-dangle */
import mongoose from "mongoose";

class DBService {
  #_db;

  constructor() {
    /** @type {typeof mongoose} */
    this.#_db = null;
  }

  async connect() {
    try {
      this.#_db = await mongoose.connect(process.env.DB_URI_REMOTE);
      console.log("connected to DB");
    } catch (error) {
      console.error("Failed to connect to DB", error);
      process.exit(1);
    }
  }
}

export default new DBService();
