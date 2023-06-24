/* eslint-disable camelcase */
import fs from 'fs';
import { startSession } from 'mongoose';
import transaction from 'mongoose-trx';
import path from 'path';
import { fileURLToPath } from 'url';
import DependencyError from '../errors/DependencyError.js';
import UnauthorizedError from '../errors/UnauthorizedError.js';
import ConflictError from '../errors/conflict.error.js';
import RoleDAO from '../repository/role.dao.js';
import TenantRepository from '../repository/tenant.repository.js';
import TenantConfigDAO from '../repository/tenantConfig.dao.js';
import UserDAO from '../repository/user.dao.js';
import SessionRepository from '../repository/userConfig.dao.js';
import WalletDAO from '../repository/wallet.dao.js';
import { status } from '../utils/common.js';
import driverUploader from '../utils/driveUploader.js';
import generateOTP from '../utils/generateOTP.js';
import logger from '../utils/logger.js';
import randomString from '../utils/randomString.js';
import EmailService from './email.service.js';

class TenantService {
  async createTenant({ tenant, user }) {
    /**
     * TODO: Check if mongoose has fixed the issue with session.withTransaction
     * TODO: method not returning the data.
     */
    user.otp = generateOTP(8);
    const session = await startSession();

    const result = await session.withTransaction(async () => {
      const [newTenant, newUser] = await Promise.all([
        TenantRepository.insert(tenant, session),
        UserDAO.insert(user, session),
        TenantConfigDAO.insert({ tenantId: tenant._id }, session),
        SessionRepository.insert(
          { tenantId: tenant._id, userId: user._id },
          session,
        ),
        // Cloning default admin user role for new tenant.
        RoleDAO.findOne({ name: 'admin', isDefault: true }).then((doc) => {
          doc._id = user.role;
          doc.tenantId = user.tenantId;
          doc.isDefault = false;
          doc.isNew = true;

          doc.save({ session });
        }),
      ]);

      await EmailService.send({
        to: user.email,
        templateName: 'new-tenant-user',
        context: { otp: user.otp.pin },
      });

      newUser.purgeSensitiveData();

      return {
        tenant: newTenant,
        user: newUser,
      };
    });
    return result;
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
    const count = Intl.NumberFormat('en-US').format(foundTenants.length);

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
    if (foundTenant.status === status.ACTIVE) {
      throw new ConflictError('Tenant has already been activated.');
    }

    foundTenant.set({
      status: status.AWAITING_ACTIVATION,
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

      if (foundTenant.status === status.ACTIVE) {
        throw new ConflictError('Tenant has already been activated.');
      }

      foundTenant.set({
        isEmailVerified: true,
        status: status.ACTIVE,
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
      UserDAO.findById(_id),
    ]);

    const { isValid, reason } = foundUser.validateOTP(otp);
    if (!isValid) throw new UnauthorizedError(reason);

    // Email super admin about tenant deactivation
    await EmailService.send({
      from: foundUser.email,
      to: 'kennedydre3@gmail.com',
      templateName: 'request-tenant-deactivation',
      context: { username: foundUser.first_name },
    });

    // Email tenant admin about tenant deactivation
    await EmailService.send({
      to: foundUser.email,
      templateName: 'requested-tenant-deactivation',
      context: { username: foundUser.first_name },
    });

    return foundTenant;
  }

  async deactivateTenant(tenantId) {
    const [foundTenant, foundAdminUsers] = await Promise.all([
      await TenantRepository.update(tenantId, { status: status.DEACTIVATED }),
      await UserDAO.find(
        { tenantId, 'role.name': 'admin' },
        { password: 0, resetPwd: 0, otp: 0 },
        { createdAt: 1 },
      ),
      await UserDAO.updateMany({ tenantId }, { active: false }),
    ]);

    const info = await EmailService.send({
      to: foundAdminUsers[0].email,
      templateName: 'deactivate-tenant',
      context: { name: foundAdminUsers[0].first_name },
    });
    if (info.error) {
      throw new DependencyError(
        'Operation failed: Error sending deactivated email to user.',
      );
    }

    return foundTenant;
  }

  async reactivateTenant(tenantId) {
    const [tenant] = await Promise.all([
      TenantRepository.update(tenantId, { active: true }),
      UserDAO.updateMany({ tenantId }, { active: true }),
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

  async uploadDocs(tenantId, uploadFiles) {
    const foundTenant = await TenantRepository.findById(tenantId);
    const folderName = `t-${tenantId.toString()}`;

    const [foundFolder] = await driverUploader.findFolder(folderName);

    // Selecting folder
    const folderId = foundFolder?.id
      ? foundFolder.id
      : await driverUploader.createFolder(folderName);

    logger.debug(folderId);

    for (const key of Object.keys(uploadFiles)) {
      const file = uploadFiles[key][0];

      const name = file.originalname;
      const __dirname = path.dirname(fileURLToPath(import.meta.url));
      const filePath = path.resolve(__dirname, `../../${file.path}`);
      const mimeType = file.mimetype;

      const response = await driverUploader.createFile(
        name,
        filePath,
        folderId,
        mimeType,
      );
      logger.debug(response.data.id);

      if (key === 'logo') {
        foundTenant.set({
          logo: response.data.id,
        });
      }

      // ! Delete uploaded file from file system
      fs.unlinkSync(filePath);
    }

    await foundTenant.save();
    return foundTenant;
  }
}

// async handleGuestLoan (payload) {
//   try {
//     const lender = await findOne({ id })

//     user = {
//       id: payload.customer.employer.ippis,
//       lender: lender._id.toString(),
//       role: 'guest',
//       email: payload.customer.contactInfo.email
//     }

//     const response = await createLoanReq(user, payload)

//     return {
//       message: 'Loan application submitted successfully.',
//       data: response.data
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'handle_guest_loan',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return { errorCode: 500, message: 'Something went wrong.' }
//   }
// }

export default TenantService;
