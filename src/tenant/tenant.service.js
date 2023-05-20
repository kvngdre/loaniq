/* eslint-disable camelcase */
import bcrypt from 'bcryptjs';
import { startSession } from 'mongoose';
import WalletDAO from '../daos/wallet.dao.js';
import DependencyError from '../errors/dependency.error.js';
import DuplicateError from '../errors/duplicate.error.js';
import NotFoundError from '../errors/notFound.error.js';
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
   * Creates a new tenant account, tenant configurations, and the admin user.
   * @param {import('./dto/signUp.dto.js').SignUpDto} signUpDto
   * @returns {Promise<AppResponse>}
   */
  async signUp(signUpDto) {
    const { newTenantDto, newUserDto } = signUpDto;
    newUserDto.configurations.otp = generateOTP(8);
    const session = await startSession();

    try {
      // ! Hashing user password
      newUserDto.configurations.password = bcrypt.hashSync(
        newUserDto.configurations.password,
      );

      await session.withTransaction(async () => {
        await Promise.all([
          tenantRepository.insert(newTenantDto, session),
          tenantConfigurationRepository.insert(
            { _id: newTenantDto.configurations, tenant: newTenantDto._id },
            session,
          ),
          userRepository.insert(newUserDto, session),
        ]);

        // * Cloning the default admin role and permissions.
        await roleRepository
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
          });

        // const { error } = await EmailService.send({
        //   to: newUserDto.email,
        //   templateName: 'new-tenant-user',
        //   context: { otp: newUserDto.configurations.otp.pin, expiresIn: 10 },
        // });
        // if (error) throw new DependencyError('Error Sending OTP to Email');
      });

      return {
        success: true,
        message: 'Check your email for OTP to complete sign up.',
      };
    } finally {
      await session.endSession();
    }
  }

  /**
   * Creates a new tenant account.
   * @param {import('./dto/new-tenant.dto.js').NewTenantDto} newTenantDto
   * @returns
   */
  async createTenant(newTenantDto) {
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        await Promise.all([
          tenantRepository.insert(newTenantDto, session),
          tenantConfigurationRepository.insert(
            { _id: newTenantDto.configurations, tenant: newTenantDto._id },
            session,
          ),
        ]);
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

  /**
   * Retrieves a list of tenants
   * @param {Partial<import('./jsdoc/Tenant.js').Tenant>} filters Tenant fields filter object
   * @returns
   */
  async getTenants(filters) {
    const foundTenants = await tenantRepository.find(filters);
    if (foundTenants.length === 0) {
      throw new NotFoundError('No tenants found');
    }

    return foundTenants;
  }

  /**
   * Retrieves a tenant
   * @param {string} tenantId The tenant object id
   * @returns
   */
  async getTenant(tenantId) {
    const foundTenant = await tenantRepository.findById(tenantId);
    if (!foundTenant) {
      throw new NotFoundError('Tenant not found');
    }

    return foundTenant;
  }

  /**
   * Updates a tenant profile
   * @param {string} tenantId
   * @param {UpdateTenantDto} updateTenantDto
   * @returns
   */
  async updateTenant(tenantId, updateTenantDto) {
    await tenantRepository.update(tenantId, updateTenantDto);
  }

  /**
   * Deletes a tenant
   * @param {string} tenantId
   * @returns
   */
  async deleteTenant(tenantId) {
    await tenantRepository.delete(tenantId);
  }

  /**
   * Updates and sets the tenant in status: Awaiting Activation.
   * @param {string} tenantId Tenant object id
   * @param {import('./dto/activate-tenant.dto.js').ActivateTenantDto} activateTenantDto
   * @returns
   */
  async requestTenantActivation(tenantId, activateTenantDto) {
    const [foundTenant, foundTenantConfig] = await Promise.all([
      tenantRepository.findById(tenantId),
      tenantConfigurationRepository.findByTenantId(tenantId),
    ]);
    if (!foundTenant) throw new NotFoundError('Tenant not found');
    if (!foundTenantConfig)
      throw new NotFoundError('Tenant configurations not found');

    if (foundTenant.status === TenantStatus.ACTIVE) {
      throw new DuplicateError('Tenant has already been activated.');
    }

    // * Setting data
    foundTenant.set({
      status: TenantStatus.AWAITING_ACTIVATION,
      ...activateTenantDto,
    });
    foundTenantConfig.set({
      ...activateTenantDto,
    });

    await Promise.all([
      await foundTenant.save(),
      await foundTenantConfig.save(),
    ]);

    return foundTenant;
  }

  /**
   * Updates and sets the tenant in status: Awaiting Activation.
   * @param {string} tenantId Tenant object id
   * @param {Partial<import('./dto/activate-tenant.dto.js').ActivateTenantDto>} activateTenantDto
   * @returns {string}
   */
  async saveTenantActivationProgress(tenantId, activateTenantDto) {
    await Promise.all([
      tenantRepository.update(tenantId, activateTenantDto),
      tenantConfigurationRepository.findByTenantIdAndUpdate(
        tenantId,
        activateTenantDto,
      ),
    ]);

    return 'Progress Saved';
  }

  /**
   * Activate a tenant account
   * @param {string} tenantId Tenant object id
   * @returns
   */
  async activateTenant(tenantId) {
    const session = await startSession();
    try {
      await session.withTransaction(async () => {
        const [foundTenant] = await Promise.all([
          tenantRepository.findById(tenantId),
          WalletDAO.insert({ tenantId }, session),
        ]);
        if (!foundTenant) throw new NotFoundError('Tenant not found');
        if (foundTenant.status === TenantStatus.ACTIVE) {
          throw new DuplicateError('Tenant has already been activated.');
        }

        foundTenant.set({ status: TenantStatus.ACTIVE, isActivated: true });
        await foundTenant.save({ session });
      });
    } finally {
      session.endSession();
    }
  }

  /**
   * Submits a request to have tenant deactivated.
   * @param {*} param0
   * @param {string} otp
   * @returns
   */
  async requestToDeactivateTenant({ _id, tenantId }, otp) {
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
