import jwt from "jsonwebtoken";
import { constants } from "../config/index.js";

export const generateAccessToken = (payload) =>
  jwt.sign(payload, constants.jwt.secret.access, {
    expiresIn: constants.jwt.exp_time.access,
    issuer: constants.jwt.issuer,
  });

export const generateRefreshToken = (payload) =>
  jwt.sign(payload, constants.jwt.secret.refresh, {
    expiresIn: constants.jwt.exp_time.refresh,
    issuer: constants.jwt.issuer,
  });
