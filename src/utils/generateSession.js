import DeviceDetector from 'node-device-detector';
import { constants } from '../config/index.js';

const detectAgent = (agent) => {
  const detector = new DeviceDetector({
    clientIndexes: true,
    deviceIndexes: true,
    deviceAliasCode: false,
  });

  const result = detector.detect(agent);
  return {
    os: result.os.name,
    client: result.client.name,
  };
};

// In milliseconds
const tokenExpirationTime = constants.jwt.exp_time.refresh * 1_000;
export default function generateSession(token, agent, ip) {
  const { os, client } = detectAgent(agent);

  return {
    os,
    client,
    ip,
    token,
    login_time: new Date(),
    expiresIn: Date.now() + tokenExpirationTime,
  };
}
