import { omit } from 'lodash'
import { getPaymentLink } from './paymentController'
import { roles } from '../utils/constants'
import { compare } from 'bcrypt'
import { get } from '../config'
import emailValidator from 'deep-email-validator'
import filterValidator from '../validators/filter.validator'
import flattenObject from '../utils/flattenObj'
import generateOTP from '../utils/generateOTP'
import generateShortUrl from '../utils/generateShortUrl'
import { createLoanReq } from './loanController'
import mailer from '../utils/mailer'
import { startSession } from 'mongoose'
import { findById } from '../models/segmentModel'
import ServerResponse from '../utils/ServerResponse'
import Settings from '../models/settings.model'
import Tenant, { findById as _findById, find, findOne } from '../models/tenant.model'
import { validateCreateTenant, validateActivateTenant } from '../validators/tenant.validator'
import User, { updateMany, findOne as _findOne } from '../models/user.model'
const debug = require('debug')('app:tenantCtrl')
const logger = require('../utils/logger').default('lenderCtrl.js')

const MONGO_DUPLICATE_ERROR_CODE = 11000

class TenantController {
  async createTenant (newTenantDto) {
    // TODO: uncomment transaction
    const session = await startSession()

    try {
      const { error } =
                validateCreateTenant(newTenantDto)
      if (error) {
        return new ServerResponse(
          400,
          this.#formatMsg(error.details[0].message)
        )
      }

      // Start transaction
      session.startTransaction()

      const { tenantDto, userDto } = newTenantDto

      // Create new tenant
      const newTenant = new Tenant(tenantDto)

      // Create new 'owner' user
      const randomPwd = Math.random().toString(36).substring(2, 8)
      const newUser = new User({
        tenantId: newTenant._id.toString(),
        name: userDto.name,
        email: userDto.email,
        phone: userDto.phone,
        password: randomPwd,
        role: roles.owner,
        otp: generateOTP()
      })

      // Create user settings
      const newSettings = new Settings({
        userId: newUser._id
      })

      await newTenant.save({ session })
      await newUser.save({ session })
      await newSettings.save({ session })

      // await newTenant.save();
      // await newUser.save();
      // await newSettings.save();

      console.log(newUser.otp.pin, randomPwd)
      // Mailing one-time-pin and one-time-password
      // const response = await mailer({
      //     to: newUser.email,
      //     subject: 'Almost there, just one more step',
      //     name: newUser.name.first,
      //     template: 'new-user',
      //     payload: { otp: newUser.otp.pin, password: randomPwd },
      // });
      // if (response instanceof Error) {
      //     await session.abortTransaction();
      //     session.endSession();

      //     logger.error({
      //         method: 'createAccount',
      //         message: response.message,
      //         meta: response.stack,
      //     });
      //     debug(response.message);
      //     return new ServerResponse(
      //         424,
      //         'Failed to create account. Error sending OTP & password'
      //     );
      // }

      // Commit changes and end transaction.
      await session.commitTransaction()
      session.endSession()

      // Delete fields from the new tenant object
      delete newTenant._doc.otp
      delete newTenant._doc.totalCost

      // Delete fields from the new user object
      delete newUser._doc.otp
      delete newUser._doc.password
      delete newUser._doc.queryName
      delete newUser._doc.refreshTokens

      return new ServerResponse(
        200,
        'Tenant created. Check user email for temporary password and OTP.',
        {
          tenant: newTenant,
          user: newUser
        }
      )
    } catch (exception) {
      // Abort changes and end transaction.
      await session.abortTransaction()
      session.endSession()

      logger.error({
        method: 'create_tenant',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      // Duplicate field error handling
      if (exception.code === MONGO_DUPLICATE_ERROR_CODE) {
        let field = Object.keys(exception.keyPattern)[0]
        field = field.charAt(0).toUpperCase() + field.slice(1)
        if (field === 'CompanyName') field = 'Company name'
        if (field === 'Phone') field = 'Phone number'
        return new ServerResponse(409, `${field} already in use`)
      }

      // Validation error handling
      if (exception.name === 'ValidationError') {
        const field = Object.keys(exception.errors)[0]
        return new ServerResponse(
          400,
          exception.errors[field].message.replace('Path', '')
        )
      }
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async activateTenant (tenantId, payload) {
    try {
      const { error } = validateActivateTenant(payload)
      if (error) {
        return new ServerResponse(
          400,
          this.#formatMsg(error.details[0].message)
        )
      }

      // TODO: work on this
      const { cacNumber, otp, support } = payload

      const foundTenant = await _findById(tenantId)
      if (!foundTenant) { return new ServerResponse(404, 'Tenant not found') }

      if (
        Date.now() > foundTenant.otp.exp ||
                otp !== foundTenant.otp.pin
      ) {
        // OTP not valid or has expired.
        return new ServerResponse(401, 'Invalid OTP')
      }

      foundTenant.set({
        emailVerified: true,
        active: true,
        'otp.OTP': null,
        'otp.exp': null,
        cacNumber,
        support
      })
      await foundTenant.save()

      delete foundTenant.otp

      return new ServerResponse(
        200,
        'Tenant has been activated',
        foundTenant
      )
    } catch (exception) {
      logger.error({
        method: 'activateTenant',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      // Duplicate field error handling
      if (exception.code === MONGO_DUPLICATE_ERROR_CODE) {
        let field = Object.keys(exception.keyPattern)[0]
        field = field.replace('cac', 'CAC')
        field = field.charAt(0).toUpperCase() + field.slice(1)
        if (field === 'CompanyName') field = 'Company name'
        if (field === 'Phone') field = 'Phone number'
        return new ServerResponse(409, `${field} already in use`)
      }

      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async getTenants (filters) {
    try {
      const { value: validatedFilters, error } = await filterValidator(
        filters
      )
      if (error) {
        return new ServerResponse(
          400,
          this.#formatMsg(error.details[0].message)
        )
      }

      const filter = getQueryFilter(validatedFilters)
      function getQueryFilter (filters) {
        const filter = {}

        if (filters?.name) { filter.companyName = new RegExp(filters.name, 'i') }

        // Number filter - wallet balance
        if (filters?.min) filter.balance = { $gte: filters.min }
        if (filters?.max) {
          const target = filter.balance ? filter.balance : {}
          filter.balance = Object.assign(target, {
            $lte: filters.max
          })
        }

        return filter
      }

      const foundTenants = await find(filter, { otp: 0 }).sort(
        'companyName'
      )
      if (foundTenants.length === 0) { return new ServerResponse(404, 'No Tenants found') }

      return new ServerResponse(200, 'Success', foundTenants)
    } catch (exception) {
      logger.error({
        method: 'getTenants',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async getTenant (tenantId) {
    try {
      const foundTenant = await _findById(tenantId, { otp: 0 })
      if (!foundTenant) { return new ServerResponse(404, 'Tenant not found.') }

      return new ServerResponse(200, 'Success', foundTenant)
    } catch (exception) {
      logger.error({
        method: 'getTenant',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async updateTenant (tenantId, alteration) {
    try {
      alteration = flattenObject(alteration)

      const foundTenant = await _findById(tenantId, { otp: 0 })
      if (!foundTenant) { return new ServerResponse(404, 'Tenant not found') }

      foundTenant.set(alteration)
      await foundTenant.save()

      return {
        message: 'Account Updated',
        data: foundTenant
      }
    } catch (exception) {
      logger.error({
        method: 'update_tenant',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      // Validation error handling
      if (exception.name === 'ValidationError') {
        const field = Object.keys(exception.errors)[0]
        return new ServerResponse(
          400,
          exception.errors[field].message.replace('path', '')
        )
      }

      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async getPublicFormData (
    shortURL,
    selectedFields = ['logo', 'companyName', 'website', 'support', 'social']
  ) {
    try {
      const foundTenant = await findOne({ public_url: shortURL })
        .select(selectedFields)
        .select('-_id -otp')
      if (!foundTenant) { return new ServerResponse(404, 'Tenant not found.') }

      const token = foundTenant.generateToken()

      const payload = delete foundTenant._id
      payload.token = token

      return new ServerResponse(200, 'Success', payload)
    } catch (exception) {
      logger.error({
        method: 'get_public_form_data',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async updateTenantSettings (id, payload) {
    try {
      // payload = convertToDotNotation(payload);
      const foundLender = await _findById(id)
      if (!foundLender) { return new ServerResponse(404, 'Tenant not found') }
      if (!foundLender.active) {
        return new ServerResponse(
          403,
          'Tenant is yet to be activated.'
        )
      }

      if (payload?.segment) {
        const isMatch = (segment) =>
          segment.id.toString() === payload.segment.id

        const index = foundLender.segments.findIndex(isMatch)
        console.log(index)

        if (index > -1) {
          // segment found, update parameters
          Object.keys(payload.segment).forEach(
            (key) =>
              (foundLender.segments[index][key] =
                                payload.segment[key])
          )
        } else {
          // segment not found, push new segment parameters
          const foundSegment = await findById(
            payload.segment.id
          )
          // check if segment exists.
          if (!foundSegment || !foundSegment.active) { return new ServerResponse(404, 'Segment not found') }

          foundLender.segments.push(payload.segment)
        }
      }

      if (payload.defaultParams) {
        Object.keys(payload.defaultParams).forEach((key) => {
          foundLender.default_params[key] = payload.defaultParams[key]
        })
      }

      await foundLender.save()

      return {
        message: 'Parameters updated.',
        data: omit(foundLender._doc, ['otp'])
      }
    } catch (exception) {
      logger.error({
        method: 'update_settings',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)

      // duplicate error
      if (exception.name === 'MongoServerError') {
        let field = Object.keys(exception.keyPattern)[0]
        field = field.charAt(0).toUpperCase() + field.slice(1)

        return new ServerResponse(409, 'Duplicate' + field)
      }

      // validation error
      if (exception.name === 'ValidationError') {
        const field = Object.keys(exception.errors)[0]
        return new ServerResponse(
          400,
          exception.errors[field].message.replace('path', '')
        )
      }

      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async generatePublicURL (tenantId) {
    try {
      const foundLender = await _findById(tenantId)
      if (!foundLender) { return new ServerResponse(404, 'Tenant not found.') }
      if (!foundLender.active) {
        return new ServerResponse(
          403,
          'Tenant is yet to be activated.'
        )
      }

      const shortUrl = await generateShortUrl()
      foundLender.set({
        publicUrl: shortUrl
      })
      await foundLender.save()

      return {
        message: 'success',
        data: `http://apexxia.co/f/${shortUrl}`
      }
    } catch (exception) {
      logger.error({
        method: 'gen_public_url',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async fundTenantWallet (id, amount) {
    try {
      const foundLender = await _findById(id)
      if (!foundLender) { return new ServerResponse(404, 'Tenant not found') }
      if (!foundLender.active) { return new ServerResponse(403, 'Tenant is yet to be activated') }

      const link = await getPaymentLink({
        lender: foundLender._id.toString(),
        balance: foundLender.balance,
        amount,
        customer: {
          name: foundLender.company_name,
          email: foundLender.email,
          phonenumber: foundLender.phone
        }
      })
      if (link instanceof ServerResponse) {
        return new ServerResponse(
          424,
          'Failed to initialize transaction'
        )
      }

      return {
        message: 'success',
        data: link.data
      }
    } catch (exception) {
      logger.error({
        method: 'fund_wallet',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async requestOtp (id) {
    try {
      // TODO: add email template.
      const foundLender = await _findById(id)
      if (!foundLender) { return new ServerResponse(404, 'Tenant not found') }

      foundLender.set({
        otp: generateOTP()
      })

      // mailing OTPs
      // const response = await mailer({
      //     to: foundLender.email,
      //     subject: 'Your one-time-pin request',
      //     name: foundLender.companyName,
      //     template: 'otp-request',
      //     payload: { otp: foundLender.otp.OTP },
      // });
      // if (response instanceof Error) {
      //     debug(`Error sending OTP: ${response.message}`);
      //     return new ServerError(424, 'Error sending OTP');
      // }

      console.log(foundLender.otp.pin)

      await foundLender.save()

      return {
        message: 'OTP sent to tenant email',
        data: {
          email: foundLender.email,
          // TODO: remove otp
          otp: foundLender.otp.OTP
        }
      }
    } catch (exception) {
      logger.error({
        method: 'request_otp',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  /**
     * Retrieves the lender wallet balance.
     * @param {string} id Identifier for lender.
     * @returns
     */
  async getTenantBalance (id) {
    try {
      const lender = await _findById(id).select(
        'companyName active balance'
      )
      if (!lender) return new ServerResponse(404, 'Tenant not found')

      return {
        message: 'success',
        data: lender
      }
    } catch (exception) {
      logger.error({
        method: 'get_balance',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async deactivateTenant (id, user, password) {
    try {
      const foundLender = await _findById(id)

      const isMatch = await compare(
        password,
        foundLender.password
      )
      if (!isMatch) { return new ServerResponse(401, 'Password is incorrect') }

      if (user.role !== roles.master) {
        // send a deactivation email request
        // TODO: Create template for deactivation.
        const response = await mailer(
          get('support.email'), // apexxia support
          foundLender.company_name,
          user.fullName
        )
        if (response instanceof Error) {
          debug(`Error sending OTP: ${response.message}`)
          return new ServerResponse(
            424,
            'Error sending deactivation email request'
          )
        }

        return {
          message:
                        'Deactivation has been sent. We would get in touch with you shortly.'
        }
      } else {
        await updateMany(
          { lender: foundLender._id.toString() },
          { active: false }
        )

        foundLender.set({ active: false })

        await foundLender.save()
        // TODO: Send account deactivated to lender

        return {
          message: 'Account deactivated'
        }
      }
    } catch (exception) {
      logger.error({
        method: 'deactivate',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return new ServerResponse(500, 'Something went wrong')
    }
  }

  async reactivateTenant (id) {
    try {
      const foundLender = await findOne({
        _id: id,
        active: false
      })
      if (!foundLender) { return new ServerResponse(404, 'Tenant not found') }

      const foundUser = await _findOne({
        lender: foundLender.id.toString(),
        role: 'Owner',
        active: false
      })
      if (!foundUser) { return new ServerResponse(404, 'Owner user not found') }

      foundLender.set({ active: true })
      foundUser.set({ active: true })

      await foundLender.save()
      await foundUser.save()

      return {
        message: 'Tenant reactivated'
      }
    } catch (exception) {
      logger.error({
        method: 'reactivate',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return { errorCode: 500, message: 'Something went wrong.' }
    }
  }

  async handleGuestLoan (payload) {
    try {
      const lender = await findOne({ id })

      user = {
        id: payload.customer.employer.ippis,
        lender: lender._id.toString(),
        role: 'guest',
        email: payload.customer.contactInfo.email
      }

      const response = await createLoanReq(user, payload)

      return {
        message: 'Loan application submitted successfully.',
        data: response.data
      }
    } catch (exception) {
      logger.error({
        method: 'handle_guest_loan',
        message: exception.message,
        meta: exception.stack
      })
      debug(exception)
      return { errorCode: 500, message: 'Something went wrong.' }
    }
  }

  #formatMsg (errorMsg) {
    console.log(errorMsg)
    const regex = /\B(?=(\d{3})+(?!\d))/g
    let msg = `${errorMsg.replaceAll('"', '')}.` // remove quotation marks.
    msg = msg.replace(regex, ',') // add comma to numbers if present in error msg.
    return msg
  }
}

export default new TenantController()
