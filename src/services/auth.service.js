/* eslint-disable eqeqeq */
/* eslint-disable camelcase */
import { constants } from '../config'
import { generateOTP, similarity } from '../helpers/universal.helpers'
import { pubsub, events } from '../pubsub'
import ConflictError from '../errors/ConflictError'
import DeviceDetector from 'node-device-detector'
import ForbiddenError from '../errors/ForbiddenError'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger'
import mailer from '../utils/mailer'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserDAO from '../daos/user.dao'
import ValidationError from '../errors/ValidationError'

function detectAgent (agent) {
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

class AuthService {
  static async verifySignUp (dto, token, userAgent, clientIp) {
    const { email, current_password, new_password } = dto

    const foundUser = await UserDAO.findOne({ email })
    if (foundUser.isEmailVerified) {
      throw new ConflictError('User already verified, please sign in.')
    }

    // Authenticate password.
    const isMatch = foundUser.comparePasswords(current_password)
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.')

    // * Measuring similarity of new password to the current password.
    const percentageSimilarity =
      similarity(new_password, current_password) * 100

    if (percentageSimilarity >= constants.max_similarity) {
      throw new ValidationError('Password is too similar to old password.')
    }

    if (token) {
      // ! Prune user refresh tokens array for expired tokens.
      foundUser.sessions = foundUser.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )
    }

    // Generating new token set.
    const accessToken = foundUser.genAccessToken()
    const refreshToken = foundUser.genRefreshToken()
    const { os, client } = detectAgent(userAgent)

    // Emitting event to update last login time on user config.
    pubsub.publish(
      events.user.updateConfig,
      foundUser._id,
      { last_login_time: new Date() }
    )

    foundUser.set({
      sessions: [
        {
          os,
          client,
          ip: clientIp,
          login_time: new Date(),
          ...refreshToken
        },
        ...foundUser.sessions
      ],
      isEmailVerified: true,
      password: new_password,
      'otp.pin': null,
      'otp.expiresIn': null,
      active: true,
      resetPwd: false
    })
    await foundUser.save()

    foundUser.purgeSensitiveData()

    return [accessToken, refreshToken, foundUser]
  }

  static async login ({ email, password }, token, userAgent, clientIp) {
    const foundUser = await UserDAO.findOne({ email }).catch(() => {
      throw new UnauthorizedError('Invalid credentials.')
    })

    const isMatch = foundUser.comparePasswords(password)
    if (!isMatch) throw new UnauthorizedError('Invalid credentials.')

    const { isGranted, message, data } = foundUser.permitLogin()
    if (!isGranted) throw new ForbiddenError(message, data)

    if (token) {
      // ! Prune user sessions for expired refresh tokens.
      foundUser.sessions = foundUser.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )

      /**
       * * Scenario simulated here:
       * * 1) User logs in, never uses the refresh token and does not logout.
       * * 2) The refresh token gets stolen
       * * 3) if 1 & 2, reuse detection is needed to clear all RTs when user logs in.
       */
      await UserDAO.findOne({ 'sessions.token': token }).catch(() => {
        // ! Refresh token reuse detected. Purge user sessions.
        logger.warn('Attempted refresh token reuse at login.')
        foundUser.set({ sessions: [] })
      })
    }

    // Generating new token set.
    const accessToken = foundUser.genAccessToken()
    const refreshToken = foundUser.genRefreshToken()
    const { os, client } = detectAgent(userAgent)

    // Emitting event to update last login time on user config.
    pubsub.publish(
      events.user.updateConfig,
      foundUser._id,
      { last_login_time: new Date() }
    )

    foundUser.sessions.unshift({
      os,
      client,
      ip: clientIp,
      login_time: new Date(),
      ...refreshToken
    })
    await foundUser.save()

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
    const foundUser = await UserDAO.findById(userId)

    foundUser.purgeSensitiveData()

    return foundUser
  }

  static async getNewTokenSet (token, userAgent) {
    const { issuer, audience, secret } = constants.jwt

    const foundUser = await UserDAO.findOne({ 'sessions.token': token }).catch(
      () => {
        logger.warn('Attempted refresh token reuse detected.')
        jwt.verify(
          token,
          secret.refresh,
          { audience, issuer },
          (err, decoded) => {
            if (err) throw err

            UserDAO.update(decoded.id, { sessions: [] }).catch((err) => {
              logger.error(err.message, err.stack)
            })
          }
        )

        throw new ForbiddenError('Forbidden')
      }
    )

    jwt.verify(token, secret.refresh, { audience, issuer }, (err, decoded) => {
      if (err) throw new ForbiddenError(err.message)

      if (decoded.id != foundUser._Id) {
        throw new ForbiddenError('Invalid token')
      }
    })

    // ! Prune user sessions for expired refresh tokens.
    foundUser.sessions = foundUser.sessions.filter(
      (s) => s.token !== token && Date.now() < s.expiresIn
    )

    // Generating new token set.
    const accessToken = foundUser.genAccessToken()
    const refreshToken = foundUser.genRefreshToken()
    const { os, client } = detectAgent(userAgent)

    foundUser.sessions.unshift({
      os,
      client,
      ...refreshToken
    })
    foundUser.save()

    return [accessToken, refreshToken]
  }

  static async sendOTP ({ email, len }) {
    const generatedOTP = generateOTP(10, len)

    const foundUser = await UserDAO.findOne({ email })
    await foundUser.updateOne({ otp: generatedOTP })

    // todo pass the time to live of the otp to the mail.
    logger.info('Sending OTP mail...')
    await mailer({
      to: email,
      subject: `Your one-time-pin: ${generatedOTP.pin}`,
      name: foundUser.first_name,
      template: 'otp-request',
      payload: { otp: generatedOTP.pin }
    })
  }

  static async logout (token) {
    try {
      const foundUser = await UserDAO.findOne({ 'sessions.token': token })

      foundUser.sessions = foundUser.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )

      await foundUser.save()
    } catch (exception) {
      logger.warn(exception.message)
    }
  }

  static async logoutAllSessions (userId, token) {
    const foundUser = await UserDAO.findById(userId)

    // ! Prune refresh token array for expired refresh tokens.
    foundUser.sessions = foundUser.sessions.filter((s) => s.token !== token)
    await foundUser.save()

    return foundUser
  }
}

export default AuthService
