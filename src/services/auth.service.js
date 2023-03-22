/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
import { constants } from '../config'
import {
  generateOTP,
  genAccessToken,
  genRefreshToken,
  permitLogin,
  similarity,
  validateOTP
} from '../helpers'
import ConflictError from '../errors/ConflictError'
import ForbiddenError from '../errors/ForbiddenError'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger'
import mailer from '../utils/mailer'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserService from './user.service'
import userConfigService from './userConfig.service'
import ValidationError from '../errors/ValidationError'
import DeviceDetector from 'node-device-detector'

class AuthService {
  static #detect = function (agent) {
    const detector = new DeviceDetector({
      clientIndexes: true,
      deviceIndexes: true,
      deviceAliasCode: false
    })

    const result = detector.detect(agent)

    return {
      os: result.os.name,
      client: result.client.name
    }
  }

  static async verifySignUp (dto, token, userAgent) {
    const { email, otp, current_password, new_password } = dto

    const foundUser = await UserService.getUser({ email }, {})
    if (foundUser.isEmailVerified) {
      throw new ConflictError('User already verified, please sign in.')
    }

    // Authenticate password.
    const isMatch = await foundUser.comparePasswords(current_password)
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.')

    validateOTP(foundUser, otp) // throws an error if OTP is invalid or expired.

    // * Measuring similarity of new password to the current password.
    const percentageSimilarity =
      similarity(new_password, current_password) * 100

    if (percentageSimilarity >= constants.max_similarity) {
      throw new ValidationError('Password is too similar to old password.')
    }

    const foundUserConfig = await userConfigService.getConfig({
      userId: foundUser._id
    })

    if (token) {
      // ! Prune user refresh tokens array for expired tokens.
      foundUserConfig.sessions = foundUserConfig.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )
    }
    // * Generating new token set.
    const accessToken = genAccessToken({ id: foundUser._id })
    const refreshToken = genRefreshToken({ id: foundUser._id })

    const { os, client } = AuthService.#detect(userAgent)

    foundUserConfig.set({ last_login_time: new Date() })
    foundUserConfig.sessions.unshift({ os, client, ...refreshToken })
    foundUser.set({
      isEmailVerified: true,
      password: new_password,
      'otp.pin': null,
      'otp.expiresIn': null,
      active: true,
      resetPwd: false
    })

    await foundUser.save()
    await foundUserConfig.save()
    foundUser.purgeSensitiveData()

    return [accessToken, refreshToken, foundUser]
  }

  static async login ({ email, password }, token, userAgent) {
    const foundUser = await UserService.getUser({ email }, {}).catch(() => {
      throw new UnauthorizedError('Invalid credentials.')
    })
    const foundUserConfig = await userConfigService.getConfig(foundUser._id)

    const isMatch = await foundUser.comparePasswords(password)
    if (!isMatch) throw new UnauthorizedError('Invalid credentials.')

    permitLogin(foundUser)

    if (token) {
      // ! Prune user sessions for expired refresh tokens.
      foundUserConfig.sessions = foundUserConfig.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )

      /**
       * * Scenario simulated here:
       * * 1) User logs in, never uses the refresh token and does not logout.
       * * 2) The refresh token gets stolen
       * * 3) if 1 & 2, reuse detection is needed to clear all RTs when user logs in.
       */
      await userConfigService
        .getConfig({ 'sessions.token': token })
        .catch(() => {
          // ! Refresh token reuse detected. Purge user sessions.
          logger.warn('Attempted refresh token reuse at login.')
          foundUserConfig.set({ sessions: [] })
        })
    }

    // Generating new token set.
    const accessToken = genAccessToken({ id: foundUser._id })
    const refreshToken = genRefreshToken({ id: foundUser._id })

    const { os, client } = AuthService.#detect(userAgent)
    foundUserConfig.sessions.push({
      os,
      client,
      ...refreshToken
    })
    foundUserConfig.set({ last_login_time: new Date() })
    await foundUserConfig.save()

    return [
      {
        id: foundUser._id,
        accessToken,
        redirect: null
      },
      refreshToken
    ]
  }

  static async getCurrentUser (userId) {
    const foundUser = await UserService.getUserById(userId)

    return foundUser
  }

  static async getNewTokenSet (token, userAgent) {
    const { issuer, audience, secret } = constants.jwt

    const userConfig = await userConfigService
      .getConfig({ 'sessions.token': token })
      .catch(() => {
        logger.warn('Attempted refresh token reuse detected.')
        jwt.verify(token, secret.refresh, (err, decoded) => {
          if (err) throw err

          userConfigService
            .updateConfig(decoded.id, { sessions: [] })
            .catch((err) => {
              logger.error(err.message, err.stack)
            })
        })

        throw new ForbiddenError('Forbidden')
      })

    jwt.verify(token, secret.refresh, { audience, issuer }, (err, decoded) => {
      if (decoded.id != userConfig.userId) {
        throw new ForbiddenError('Invalid token.')
      }
      if (err) throw new ForbiddenError(err.message)
    })

    // Generating new token set.
    const accessToken = genAccessToken({ id: userConfig.userId })
    const refreshToken = genRefreshToken({ id: userConfig.userId })

    // ! Prune user sessions for expired refresh tokens.
    userConfig.sessions = userConfig.sessions.filter(
      (s) => s.token !== token && Date.now() < s.expiresIn
    )

    // Updating user refresh token array
    const { os, client } = AuthService.#detect(userAgent)
    userConfig.sessions.push({
      os,
      client,
      ...refreshToken
    })
    await userConfig.save()

    return [accessToken, refreshToken]
  }

  static async sendOTP ({ email, len }) {
    const foundUser = await UserService.getUser({ email }, {})

    const generatedOTP = generateOTP(10, len)
    foundUser.set({ otp: generatedOTP })
    await foundUser.save()

    logger.info('Sending OTP mail...')
    await mailer({
      to: email,
      subject: `Account verification code: ${generatedOTP.pin}`,
      name: foundUser.first_name,
      template: 'otp-request',
      payload: { otp: generatedOTP.pin }
    })
  }

  static async logout (token) {
    //  todo merge the two and collapse the try-catch
    try {
      const foundUserConfig = await userConfigService.getConfig({
        'sessions.token': token
      })

      foundUserConfig.sessions = foundUserConfig.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )
      await foundUserConfig.save()

      return [200, 'User logged out']
    } catch (exception) {
      return [204, null]
    }
  }

  static async logoutAllSessions (userId, token) {
    const foundUserConfig = await userConfigService.getConfig(userId)

    // ! Prune refresh token array for expired refresh tokens.
    foundUserConfig.sessions = foundUserConfig.sessions.filter(
      (s) => s.token !== token
    )
    await foundUserConfig.save()

    return foundUserConfig
  }
}

export default AuthService
