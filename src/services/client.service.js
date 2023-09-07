import ClientDAO from "../daos/client.dao.js";
import { status } from "../utils/common.js";
import UnauthorizedError from "../utils/errors/UnauthorizedError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateJWT.js";
import generateSession from "../utils/generateSession.js";

class ClientService {
  static create = async (newClientDTO) => {
    const newClient = await ClientDAO.insert(newClientDTO);

    return newClient;
  };

  static register = async (newClientSignupDTO) => {
    const newClient = await ClientDAO.insert(newClientSignupDTO);

    newClient.purgeSensitiveData();

    return newClient;
  };

  static verifyClient = async (
    { phoneOrStaffId, otp },
    userAgent,
    clientIp,
  ) => {
    const foundClient = await ClientDAO.findOne({
      $or: [{ phone_number: phoneOrStaffId }, { staff_id: phoneOrStaffId }],
    });

    const { isValid, reason } = foundClient.validateOTP(otp);
    if (!isValid) throw new UnauthorizedError(reason);

    const accessToken = generateAccessToken({ id: foundClient._id });
    const refreshToken = generateRefreshToken({ id: foundClient._id });
    const newSession = generateSession(refreshToken, userAgent, clientIp);

    foundClient.set({
      isPhoneVerified: true,
      status: status.ACTIVE,
      "otp.pin": null,
      "otp.expiresIn": null,
      last_login_time: new Date(),
      resetPwd: false,
      session: newSession,
    });

    foundClient.purgeSensitiveData();

    return { accessToken, refreshToken, foundClient };
  };

  static getClients = async (
    filter,
    projection = {
      password: 0,
      salt: 0,
      otp: 0,
      resetPwd: 0,
    },
  ) => {
    const foundClients = await ClientDAO.find(filter, projection);
    const count = Intl.NumberFormat("en-US").format(foundClients.length);

    return { count, foundClients };
  };

  static getClientById = async (clientId) => {
    const foundClient = await ClientDAO.findById(clientId);

    return foundClient;
  };
}

export default ClientService;
