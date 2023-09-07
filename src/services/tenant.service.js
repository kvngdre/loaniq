/* eslint-disable no-underscore-dangle */
/* eslint-disable camelcase */
import { startSession } from "mongoose";

import { TenantRepository } from "../data/repositories/index.js";
import { TENANT_STATUS } from "../utils/common.js";
import {
  ConflictError,
  DependencyError,
  UnauthorizedError,
} from "../utils/errors/index.js";
import { genRandomString } from "../utils/randomString.js";
import { EmailService } from "./email.service.js";

export class TenantService {
  static async create(createTenantDto) {
    const session = await startSession();
    try {
      return TenantRepository.save(createTenantDto);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      await session.endSession();
    }
  }

  static async onBoardTenant(tenantId, onBoardTenantDTO) {
    const foundTenant = await TenantRepository.update(
      tenantId,
      onBoardTenantDTO,
    );

    return foundTenant;
  }

  static async getTenants(filters) {
    const foundTenants = await TenantRepository.find(filters);
    const count = Intl.NumberFormat("en-US").format(foundTenants.length);

    return [count, foundTenants];
  }

  static async getTenant(tenantId) {
    const foundTenant = await TenantRepository.findById(tenantId);
    return foundTenant;
  }

  static async updateTenant(tenantId, dto) {
    const updateTenant = await TenantRepository.update(tenantId, dto);
    return updateTenant;
  }

  static async deleteTenant(tenantId) {
    const deletedTenant = await TenantRepository.remove(tenantId);
    return deletedTenant;
  }

  static async requestToActivateTenant(tenantId, activateTenantDTO) {
    const foundTenant = await TenantRepository.findById(tenantId);
    if (foundTenant.status === TENANT_STATUS.ACTIVE) {
      throw new ConflictError("Tenant has already been activated.");
    }

    foundTenant.set({
      status: TENANT_STATUS.AWAITING_ACTIVATION,
      ...activateTenantDTO,
    });
    await foundTenant.save();

    return foundTenant;
  }

  // TODO: Change to mongoose-trx
  static async activateTenant(tenantId) {
    const transactionSession = await startSession();
    try {
      transactionSession.startTransaction();

      const [foundTenant] = await Promise.all([
        TenantRepository.findById(tenantId),
        WalletDAO.insert({ tenantId }, transactionSession),
      ]);

      if (foundTenant.status === TENANT_STATUS.ACTIVE) {
        throw new ConflictError("Tenant has already been activated.");
      }

      foundTenant.set({
        isEmailVerified: true,
        status: TENANT_STATUS.ACTIVE,
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

  static async requestToDeactivateTenant({ _id, tenantId }, { otp }) {
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

  static async deactivateTenant(tenantId) {
    const [foundTenant, foundAdminUsers] = await Promise.all([
      await TenantRepository.update(tenantId, {
        status: TENANT_STATUS.DEACTIVATED,
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

  static async reactivateTenant(tenantId) {
    const [tenant] = await Promise.all([
      TenantRepository.update(tenantId, { active: true }),
      userRepository.updateMany({ tenantId }, { active: true }),
    ]);

    return tenant;
  }

  static async generateFormId(tenantId) {
    try {
      const formId = genRandomString(5);
      const updatedConfig = await TenantConfigDAO.update(tenantId, { formId });

      return updatedConfig;
    } catch (error) {
      await this.generateFormId(tenantId);
    }
  }

  static async getFormData(formId) {
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
