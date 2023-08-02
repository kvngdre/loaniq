import express from "express";
import pkg from "../../package.json" assert { type: "json" };
import { HttpCode } from "../utils/common.js";

const app = express();
app.set("pkg", pkg);

const router = express.Router();

router.get("/status", (_req, res) => {
  try {
    res.status(HttpCode.OK).json({ message: "OK ✔" });
  } catch (exception) {
    res.status(HttpCode.BAD_REQUEST).json({ error: exception.message });
  }
});

router.get("/info", (_req, res) => {
  const info = {
    appName: app.get("pkg").name,
    appDescription: app.get("pkg").description,
    appAuthor: app.get("pkg").author,
    appVersion: app.get("pkg").version,
  };

  res.status(HttpCode.OK).json(info);
});

export default router;
