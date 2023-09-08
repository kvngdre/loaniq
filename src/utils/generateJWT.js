import jwt from "jsonwebtoken";
import { config } from "../config/index.js";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.secret.access, {
    expiresIn: config.jwt.exp_time.access,
    issuer: config.jwt.issuer,
  });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.secret.refresh, {
    expiresIn: config.jwt.exp_time.refresh,
    issuer: config.jwt.issuer,
  });
