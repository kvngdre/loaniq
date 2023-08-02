/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { startSession } from "mongoose";

import {
  ConflictError,
  DependencyError,
  UnauthorizedError,
} from "../errors/index.js";
import { userRepository } from "../repositories/index.js";
import { TenantRepository } from "../repositories/tenant.repository.js";
import { TokenRepository } from "../repositories/token.repository.js";
import generateOTP from "../utils/generateOTP.js";
import randomString from "../utils/randomString.js";
import EmailService from "./email.service.js";

class TenantService {
  async createTenant(signUpDto) {
    const otp = generateOTP(8);
    const session = await startSession();

    await session.withTransaction(async () => {
      const [user] = await Promise.all([
        userRepository.insert(signUpDto, session),
        TenantRepository.save(signUpDto, session),
      ]);

      await TokenRepository.save(
        {
          user: user._id,
          token: otp.pin,
          type: "sign-up token",
          expirationTime: otp.expires,
          isUsed: false,
        },
        session,
      );
    });

    await EmailService.send({
      to: signUpDto.email,
      templateName: "new-tenant-user",
      context: { otp: otp.pin },
    });

    return {
      message: "You have successfully signed up for the service.",
      data: {
        next_steps: [
          "Check email for an OTP to verify your account.",
          "Log in and explore the features.",
          "Customize your profile, manage your settings, and access our support.",
        ],
      },
    };
  }

  async onBoardTenant(tenantId, onBoardTenantDTO) {
    const foundTenant = await TenantRepository.update(
      tenantId,
      onBoardTenantDTO,
    );

    return foundTenant;
  }

  async getTenants(filters) {
    const foundTenants = await TenantRepository.find(filters);
    const count = Intl.NumberFormat("en-US").format(foundTenants.length);

    return [count, foundTenants];
  }

  async getTenant(tenantId) {
    const foundTenant = await TenantRepository.findById(tenantId);
    return foundTenant;
  }

  async updateTenant(tenantId, dto) {
    const updateTenant = await TenantRepository.update(tenantId, dto);
    return updateTenant;
  }

  async deleteTenant(tenantId) {
    const deletedTenant = await TenantRepository.remove(tenantId);
    return deletedTenant;
  }

  async requestToActivateTenant(tenantId, activateTenantDTO) {
    const foundTenant = await TenantRepository.findById(tenantId);
    if (foundTenant.status === ENTITY_STATUS.ACTIVE) {
      throw new ConflictError("Tenant has already been activated.");
    }

    foundTenant.set({
      status: ENTITY_STATUS.AWAITING_ACTIVATION,
      ...activateTenantDTO,
    });
    await foundTenant.save();

    return foundTenant;
  }

  // TODO: Change to mongoose-trx
  async activateTenant(tenantId) {
    const transactionSession = await startSession();
    try {
      transactionSession.startTransaction();

      const [foundTenant] = await Promise.all([
        TenantRepository.findById(tenantId),
        WalletDAO.insert({ tenantId }, transactionSession),
      ]);

      if (foundTenant.status === ENTITY_STATUS.ACTIVE) {
        throw new ConflictError("Tenant has already been activated.");
      }

      foundTenant.set({
        isEmailVerified: true,
        status: ENTITY_STATUS.ACTIVE,
        activated: true,
      });
      await foundTenant.save({ session: transactionSession });
      await transactionSession.commitTransaction();

      return foundTenant;
    } catch (exception) {
      transactionSession.abortTransaction();

      throw exception;
    } finally {
      transactionSession.endSession();
    }
  }

  async requestToDeactivateTenant({ _id, tenantId }, { otp }) {
    const [foundTenant, foundUser] = await Promise.all([
      TenantRepository.findById(tenantId),
      userRepository.findById(_id),
    ]);

    const { isValid, reason } = foundUser.validateOTP(otp);
    if (!isValid) throw new UnauthorizedError(reason);

    // Email super admin about tenant deactivation
    await EmailService.send({
      from: foundUser.email,
      to: "kennedydre3@gmail.com",
      templateName: "request-tenant-deactivation",
      context: { username: foundUser.first_name },
    });

    // Email tenant admin about tenant deactivation
    await EmailService.send({
      to: foundUser.email,
      templateName: "requested-tenant-deactivation",
      context: { username: foundUser.first_name },
    });

    return foundTenant;
  }

  async deactivateTenant(tenantId) {
    const [foundTenant, foundAdminUsers] = await Promise.all([
      await TenantRepository.update(tenantId, {
        status: ENTITY_STATUS.DEACTIVATED,
      }),
      await userRepository.find(
        { tenantId, "role.name": "admin" },
        { password: 0, resetPwd: 0, otp: 0 },
        { createdAt: 1 },
      ),
      await userRepository.updateMany({ tenantId }, { active: false }),
    ]);

    const info = await EmailService.send({
      to: foundAdminUsers[0].email,
      templateName: "deactivate-tenant",
      context: { name: foundAdminUsers[0].first_name },
    });
    if (info.error) {
      throw new DependencyError(
        "Operation failed: Error sending deactivated email to user.",
      );
    }

    return foundTenant;
  }

  async reactivateTenant(tenantId) {
    const [tenant] = await Promise.all([
      TenantRepository.update(tenantId, { active: true }),
      userRepository.updateMany({ tenantId }, { active: true }),
    ]);

    return tenant;
  }

  async generateFormId(tenantId) {
    try {
      const formId = randomString(5);
      const updatedConfig = await TenantConfigDAO.update(tenantId, { formId });

      return updatedConfig;
    } catch (error) {
      await this.generateFormId(tenantId);
    }
  }

  async getFormData(formId) {
    const { form_theme, socials, tenantId } = await TenantConfigDAO.findOne({
      formId,
    });

    return {
      logo: tenantId.logo,
      name: tenantId.company_name,
      support: tenantId.support,
      socials,
      theme: form_theme,
    };
  }
}

export const tenantService = new TenantService();
