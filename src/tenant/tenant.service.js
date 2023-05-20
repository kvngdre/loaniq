/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { startSession } from 'mongoose';
import WalletDAO from '../daos/wallet.dao.js';
import DependencyError from '../errors/dependency.error.js';
import DuplicateError from '../errors/duplicate.error.js';
import UnauthorizedError from '../errors/unauthorized.error.js';
import RoleRepository from '../role/role.repository.js';
import EmailService from '../services/email.service.js';
import TenantConfigurationRepository from '../tenant-configurations/tenantConfig.repository.js';
import UserRepository from '../user/user.repository.js';
import { TenantStatus } from '../utils/common.js';
import generateOTP from '../utils/generateOTP.js';
import randomString from '../utils/randomString.js';
import TenantRepository from './tenant.repository.js';

const tenantRepository = new TenantRepository();
const tenantConfigurationRepository = new TenantConfigurationRepository();
const userRepository = new UserRepository();
const roleRepository = new RoleRepository();

class TenantService {
  /**
   * Creates a new tenant account and the admin user.
   * @param {import('./dto/signUp.dto.js').SignUpDto} signUpDto
   * @returns
   */
  async createTenant(signUpDto) {
    const { newTenantDto, newUserDto } = signUpDto;
    const session = await startSession();

    try {
      // ! Hashing user password
      newUserDto.configurations.password = bcrypt.hashSync(
        newUserDto.configurations.password,
      );
      newUserDto.configurations.otp = generateOTP(8);

      await session.withTransaction(async () => {
        await Promise.all([
          tenantRepository.insert(newTenantDto, session),
          tenantConfigurationRepository.insert(
            { _id: newTenantDto.configurations, tenant: newTenantDto._id },
            session,
          ),
          userRepository.insert(newUserDto, session),

          // * Cloning the default admin role and permissions.
          roleRepository
            .findOne({ name: 'default-admin', isDefault: true })
            .then((doc) => {
              if (!doc) throw new Error('Default admin user role not found');

              doc._id = newUserDto.role;
              doc.isDefault = false;
              doc.name = 'admin';
              doc.createdAt = new Date();
              doc.updatedAt = new Date();
              doc.isNew = true;
              doc.save({ session });
            }),
        ]);

        // const { error } = await EmailService.send({
        //   to: newUserDto.email,
        //   templateName: 'new-tenant-user',
        //   context: { otp: newUserDto.configurations.otp.pin, expiresIn: 10 },
        // });
        // if (error) throw new DependencyError('Error Sending OTP to Email');
      });
    } finally {
      await session.endSession();
    }
  }

  async onBoardTenant(tenantId, onBoardTenantDTO) {
    const foundTenant = await TenantRepository.update(
      tenantId,
      onBoardTenantDTO,
    );

    return foundTenant;
  }

  async getTenants(filters) {
    const foundTenants = await tenantRepository.find(filters);
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
    if (foundTenant.status === TenantStatus.ACTIVE) {
      throw new DuplicateError('Tenant has already been activated.');
    }

    foundTenant.set({
      status: TenantStatus.AWAITING_ACTIVATION,
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

      if (foundTenant.status === TenantStatus.ACTIVE) {
        throw new DuplicateError('Tenant has already been activated.');
      }

      foundTenant.set({
        isEmailVerified: true,
        status: TenantStatus.ACTIVE,
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
      UserRepository.findById(_id),
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
      await TenantRepository.update(tenantId, {
        status: TenantStatus.DEACTIVATED,
      }),
      await UserRepository.find(
        { tenantId, 'role.name': 'admin' },
        { password: 0, resetPwd: 0, otp: 0 },
        { createdAt: 1 },
      ),
      await UserRepository.updateMany({ tenantId }, { active: false }),
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
      UserRepository.updateMany({ tenantId }, { active: true }),
    ]);

    return tenant;
  }

  async generateFormId(tenantId) {
    try {
      const formId = randomString(5);
      const updatedConfig = await TenantConfigurationRepository.update(
        tenantId,
        { formId },
      );

      return updatedConfig;
    } catch (error) {
      await this.generateFormId(tenantId);
    }
  }

  async getFormData(formId) {
    const { form_theme, socials, tenantId } =
      await TenantConfigurationRepository.findOne({
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

export default new TenantService();
