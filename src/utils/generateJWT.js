import { constants } from '../config/index.js';
import jwt from 'jsonwebtoken';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, constants.jwt.secret.access, {
    expiresIn: constants.jwt.exp_time.access,
    issuer: constants.jwt.issuer,
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, constants.jwt.secret.refresh, {
    expiresIn: constants.jwt.exp_time.refresh,
    issuer: constants.jwt.issuer,
  });
};
