import { omit } from 'lodash'
import { roles } from '../utils/constants'
import { compare } from 'bcryptjs'
import { get } from '../config'
import generateOTP from '../utils/generateOTP'
import { findById } from '../models/tenant.model'
import mailer from '../utils/mailer'
import { find } from '../models/segment.model'
import ServerError from '../errors/serverError'
import Settings, { deleteOne } from '../models/settings.model'
import similarity from '../utils/similarity'
import User, { findOne, find as _find, findById as _findById } from '../models/user.model'
import ServerResponse from '../utils/ServerResponse'
const debug = require('debug')('app:userCtrl')
const logger = require('../utils/logger')

export async function create (user, payload) {
  try {
    const foundLender = await findById(user.lender)
    if (!foundLender) { return new ServerError(404, 'Tenant not found') }
    if (!foundLender.active) { return new ServerError(403, 'Tenant is yet to be activated') }

    // only owners can create admins
    if (payload.role === roles.admin && user.role !== roles.owner) {
      return new ServerError(
        401,
        'Only an owner can create admin users.'
      )
    }

    const allSegments = await find({ active: true }).select(
      '_id'
    )

    const newUser = new User(payload)
    newUser.lender = user.lender
    newUser.segments =
            payload.segments === 'all' ? allSegments : payload.segments
    const randomPwd = Math.random().toString(36).substring(2, 8)
    newUser.password = randomPwd
    newUser.otp = generateOTP()

    const settings = new Settings({
      userId: newUser._id
    })

    // validating user
    const userError = newUser.validateSync()
    if (userError) {
      const msg = userError.errors[Object.keys(userError.errors)[0]].message
      return new ServerError(400, msg)
    }

    // validating user settings
    const settingsError = settings.validateSync()
    if (settingsError) {
      const msg = settingsError.errors[Object.keys(settingsError.errors)[0]]
        .message
      return new ServerError(400, msg)
    }

    await newUser.save()
    await settings.save()

    // TODO: email template
    // mailing OTPs
    const response = await mailer({
      to: newUser.email,
      subject: 'One more step',
      name: newUser.name.first,
      template: 'new-user',
      payload: { otp: otp.OTP, password: randomPwd }
    })
    if (response instanceof Error) {
      // delete record if mail fails to send
      await newUser.delete()
      await settings.delete()

      logger.error({
        method: 'create',
        message: response.message,
        meta: response.stack
      })
      debug(response.message)
      return new ServerError(
        424,
        'Error sending password & OTP to user email'
      )
    }

    return {
      message: 'User created. Password & OTP sent to user email.',
      data: omit(newUser._doc, [
        'password',
        'otp',
        'queryName',
        'refreshTokens',
        'resetPwd'
      ])
    }
  } catch (exception) {
    logger.error({
      method: 'create',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)

    // Duplicate field error.
    if (exception.name === 'MongoServerError') {
      let field = Object.keys(exception.keyPattern)[0]
      field = field.charAt(0).toUpperCase() + field.slice(1)
      if (field === 'Phone') { field = 'Phone number' }

      return new ServerError(409, field + ' is already in use')
    }

    // Validation Error
    if (exception.name === 'ValidationError') {
      const field = Object.keys(exception.errors)[0]

      return new ServerError(
        400,
        exception.errors[field].message.replace('Path', '')
      )
    }

    return new ServerError(500, 'Something went wrong')
  }
}
export async function verifySignUp (email,
  currentPassword,
  newPassword,
  otp,
  cookies,
  res) {
  try {
    const foundUser = await findOne({ email })
    if (!foundUser) { return new ServerResponse(401, 'Invalid credentials') }
    if (!foundUser.resetPwd) { return new ServerResponse(409, 'Account has been activated') }

    const isMatch = await compare(
      currentPassword,
      foundUser.password
    )
    if (!isMatch) { return new ServerResponse(401, 'Invalid credentials') }

    // otp expired or incorrect
    if (Date.now() > foundUser.otp.exp || otp !== foundUser.otp.pin) { return new ServerResponse(400, 'Invalid OTP') }

    const percentageSimilarity = similarity(newPassword, currentPassword) * 100
    const similarityThreshold = parseInt(get('max_similarity'))
    if (percentageSimilarity >= similarityThreshold) {
      return new ServerResponse(
        400,
        'Password is too similar to old password.'
      )
    }

    const accessToken = foundUser.generateAccessToken()
    const newRefreshToken = foundUser.generateRefreshToken()

    if (cookies?.jwt) {
      // If found jwt cookie, del from db to reissue a new refresh token
      foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (rt) => rt.token !== cookies.jwt && Date.now() < rt.exp
      )
      // TODO: uncomment secure
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: get('secure_cookie')
      })
    }

    foundUser.refreshTokens.push(newRefreshToken)
    foundUser.set({
      emailVerified: true,
      password: newPassword,
      'otp.OTP': null,
      'otp.exp': null,
      active: true,
      resetPwd: false,
      lastLoginTime: new Date()
    })
    await foundUser.save()

    const expires = parseInt(get('jwt.expTime.refresh')) * 1000 // convert to milliseconds

    // TODO: uncomment secure in prod
    res.cookie('jwt', newRefreshToken.token, {
      httpOnly: true,
      sameSite: 'None',
      secure: get('secure_cookie'),
      maxAge: expires
    })

    return new ServerResponse(
      200,
      'Email verified and account activated',
      {
        new: false,
        user: omit(foundUser._doc, [
          'password',
          'otp',
          'refreshTokens'
        ]),
        accessToken
      }
    )
  } catch (exception) {
    logger.error({
      method: 'verify_sign_up',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerResponse(500, 'Something went wrong')
  }
}
export async function uploadImage () {
  try {
  } catch (exception) {
    return new ServerError(500, 'Something went wrong')
  }
}
export async function getAll (user, filters) {
  try {
    const queryFilter = user.role === roles.master ? {} : { lender: user.lender }
    applyFilters(filters)
    function applyFilters (filters) {
      if (filters?.name) { queryFilter.queryName = new RegExp(filters.name, 'i') }
      if (filters?.lender) { queryFilter.lender = filters.lender }
      if (filters?.role) { queryFilter.role = filters.role }
    }

    const foundUsers = await _find(queryFilter, {
      password: 0,
      queryName: 0,
      refreshTokens: 0,
      otp: 0,
      resetPwd: 0
    }).sort('name.first')
    if (foundUsers.length === 0) { return new ServerError(404, 'No users found') }

    return {
      message: 'success',
      data: foundUsers
    }
  } catch (exception) {
    logger.error({
      method: 'get_users',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function getOne (id) {
  try {
    const foundUser = await _findById(id, {
      password: 0,
      queryName: 0,
      refreshTokens: 0,
      otp: 0,
      resetPwd: 0
    })
    if (!foundUser) { return new ServerError(404, 'No users found') }

    return {
      message: 'success',
      data: foundUser
    }
  } catch (exception) {
    logger.error({
      method: 'get_user',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function update (id, user, alteration) {
  try {
    const foundUser = await _findById(id, {
      password: 0,
      queryName: 0,
      refreshTokens: 0,
      otp: 0
    })
    if (!foundUser) { return new ServerError(404, 'User not found') }

    // role reassignment
    if (alteration?.role) {
      // user role is neither master nor owner or attempting to change owner role
      if (foundUser.role === roles.owner ||
                ![roles.master, roles.owner].includes(user.role)) {
        return new ServerError(
          403,
          'Cannot perform role reassignment'
        )
      }

      foundUser.role = alteration.role
      delete alteration.role
    }

    // segment reassignment
    if (alteration?.segments) {
      // user is neither an admin, master nor owner role
      // or attempting to assign a segment to none bus.dev roles(credit, agent).
      if (![roles.credit, roles.agent].includes(foundUser.role) ||
                ![roles.admin, roles.master, roles.owner].includes(
                  user.role
                )) {
        return new ServerError(
          403,
          'Cannot perform segment assignment'
        )
      }

      foundUser.segments = alteration.segments
      delete alteration.segments
    }

    foundUser.set(alteration)
    await foundUser.save()

    return {
      message: 'User profile updated',
      data: foundUser
    }
  } catch (exception) {
    logger.error({
      method: 'update',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function forgotPassword (email) {
  try {
  } catch (exception) {
    logger.error({
      method: 'update',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function changePassword (user, payload) {
  try {
    const { currentPassword, newPassword } = payload

    const foundUser = await _findById(user.id, {
      queryName: 0,
      refreshTokens: 0,
      otp: 0,
      resetPwd: 0
    })
    if (!foundUser) { return new ServerError(404, 'User not found') }

    const isMatch = await compare(
      currentPassword,
      foundUser.password
    )
    if (!isMatch) { return new ServerError(401, 'Invalid credentials') }

    const percentageSimilarity = similarity(newPassword, currentPassword) * 100
    const similarityThreshold = parseInt(get('max_similarity'))
    if (percentageSimilarity >= similarityThreshold) {
      return new ServerError(
        400,
        'Password is too similar to old password.'
      )
    }

    foundUser.set({
      password: newPassword,
      refreshTokens: []
    })
    await foundUser.save()

    return {
      message: 'Password updated.',
      data: foundUser
    }
  } catch (exception) {
    logger.error({
      method: 'change_password',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function resetPassword (id) {
  try {
    const foundUser = await _findById(id, {
      queryName: 0
    })
    if (!foundUser) { return new ServerError(404, 'No users found') }

    const otp = generateOTP()
    const randomPwd = Math.random().toString(36).substring(2, 8)

    // TODO: email template
    // mailing OTPs
    const response = await mailer({
      to: foundUser.email,
      subject: 'Apexxia Password Reset',
      name: foundUser.name.first,
      template: 'new-user',
      payload: { otp: otp.OTP, password: randomPwd }
    })
    if (response instanceof Error) {
      logger.error({
        method: 'request_otp',
        message: response.message,
        meta: response.stack
      })
      debug(response)
      return new ServerError(424, 'Error sending OTP to email')
    }

    foundUser.set({
      active: false,
      resetPwd: true,
      otp,
      password: randomPwd,
      refreshTokens: []
    })
    await foundUser.save()

    return {
      message: 'Success. Password and OTP sent to user email. ',
      data: omit(foundUser._doc, [
        'resetPwd',
        // 'otp',
        // 'password',
        'refreshTokens'
      ])
    }
  } catch (exception) {
    logger.error({
      method: 'reset_password',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Something went wrong')
  }
}
export async function requestOtp (email) {
  try {
    const foundUser = await findOne({ email }).select(
      'name email active otp'
    )
    if (!foundUser) { return new ServerError(404, 'User not found') }

    const otp = generateOTP()

    // TODO: email template
    // mailing OTP
    // const response = await mailer({
    //     to: foundUser.email,
    //     subject: 'Your one-time-pin request',
    //     name: foundUser.name.first,
    //     template: 'otp-request',
    //     payload: { otp: otp.OTP },
    // });
    // if (response instanceof Error) {
    //     logger.error({
    //         method: 'request_otp',
    //         message: exception.message,
    //         meta: exception.stack,
    //     });
    //     debug(response);
    //     return new ServerError(424, 'Error sending OTP to email');
    // }
    console.log(otp)

    foundUser.set({ otp })
    await foundUser.save()

    return {
      message: 'OTP sent to email',
      data: {
        email: foundUser.email,
        // TODO: remove otp
        otp: foundUser.otp.OTP
      }
    }
  } catch (exception) {
    logger.error({
      method: 'request_otp',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Internal Server Error')
  }
}
export async function deactivate (id, user, password) {
  try {
    if (!password) { return new ServerError(400, 'Password is required.') }

    const foundUser = await findOne(
      { _id: id, role: { $ne: roles.owner } },
      {
        password: 0,
        queryName: 0,
        otp: 0,
        resetPwd: 0
      }
    )
    if (!foundUser) { return new ServerError(404, 'User not found') }

    const adminUser = await _findById(user.id, {
      queryName: 0,
      refreshTokens: 0,
      otp: 0,
      resetPwd: 0
    })
    const isMatch = await compare(password, adminUser.password)
    if (!isMatch) { return new ServerError(401, 'Invalid credentials') }

    foundUser.set({
      active: false,
      refreshTokens: []
    })
    await foundUser.save()

    return {
      message: 'User profile deactivated',
      data: omit(foundUser._doc, ['refreshTokens'])
    }
  } catch (exception) {
    logger.error({
      method: 'deactivate',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Internal Server Error')
  }
}
export async function delete_ (id, user, password) {
  try {
    if (!password) { return new ServerError(400, 'Password is required') }

    const foundUser = await findOne(
      { _id: id, role: { $ne: roles.owner } },
      {
        password: 0,
        queryName: 0,
        otp: 0,
        resetPwd: 0
      }
    )
    if (!foundUser) { return new ServerError(404, 'User not found') }

    const adminUser = await _findById(user.id, {
      queryName: 0,
      refreshTokens: 0,
      otp: 0,
      resetPwd: 0
    })
    const isMatch = await compare(password, adminUser.password)
    if (!isMatch) { return new ServerError(401, 'Invalid credentials') }

    await deleteOne({ userId: foundUser._id })
    await foundUser.delete()

    return {
      message: 'User profile deleted.'
    }
  } catch (exception) {
    logger.error({
      method: 'delete',
      message: exception.message,
      meta: exception.stack
    })
    debug(exception)
    return new ServerError(500, 'Internal Server Error')
  }
}
