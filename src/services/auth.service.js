/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
import { constants } from '../config/index.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateJWT.js'
import ConflictError from '../errors/ConflictError.js'
import DependencyError from '../errors/DependencyError.js'
import EmailService from './email.service.js'
import ForbiddenError from '../errors/ForbiddenError.js'
import generateOTP from '../utils/generateOTP.js'
import generateSession from '../utils/generateSession.js'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'
import UnauthorizedError from '../errors/UnauthorizedError.js'
import userConfigService from './userConfig.service.js'
import UserDAO from '../daos/user.dao.js'

class AuthService {
  static async login ({ email, password }, token, userAgent, clientIp) {
    const foundUser = await UserDAO.findOne({ email })

    const isValid = foundUser.validatePassword(password)
    if (!isValid) throw new UnauthorizedError('Invalid credentials')

    const { isGranted, message, data } = foundUser.permitLogin()
    if (!isGranted) throw new ForbiddenError(message, data)

    const userConfig = await userConfigService.getConfig({ userId: foundUser._id })

    // ! Prune user sessions for expired refresh tokens.
    if (token) {
      userConfig.sessions = userConfig.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )
    } else {
      userConfig.sessions = userConfig.sessions.filter(
        (s) => Date.now() < s.expiresIn
      )
    }

    if (userConfig.sessions.length >= 3) {
      throw new ConflictError('Maximum allowed devices reached.')
    }

    const accessToken = generateAccessToken({ id: foundUser._id })
    const refreshToken = generateRefreshToken({ id: foundUser._id })
    const newSession = generateSession(refreshToken, userAgent, clientIp)

    await Promise.all([
      foundUser.updateOne({ last_login_time: new Date() }),
      userConfig.updateOne({ sessions: [newSession, ...userConfig.sessions] })
    ])

    foundUser.purgeSensitiveData()

    return [{ user: foundUser, accessToken, redirect: null }, refreshToken]
  }

  static async getNewTokens (token) {
    const { issuer, secret } = constants.jwt

    const userConfig = await userConfigService
      .getConfig({ 'sessions.token': token })
      .catch(() => {
        logger.warn('Attempted refresh token reuse detected.')

        jwt.verify(token, secret.refresh, { issuer }, (err, decoded) => {
          if (err) throw err

          userConfigService
            .updateConfig(decoded.id, { sessions: [] })
            .catch((err) => {
              logger.error(err.message, err.stack)
            })
        })

        throw new ForbiddenError('Forbidden')
      })

    jwt.verify(token, secret.refresh, { issuer }, (err, decoded) => {
      if (err) throw new ForbiddenError(err.message)

      if (decoded.id != userConfig.userId) {
        throw new ForbiddenError('Invalid token')
      }
    })

    const currentSession = userConfig.sessions.find((s) => s.token === token)
    const accessToken = generateAccessToken({ id: userConfig.userId })
    const refreshToken = generateRefreshToken({ id: userConfig.userId })

    // ! Prune user sessions for expired refresh tokens.
    const filteredSessions = userConfig.sessions.filter(
      (s) => s.token !== token && Date.now() < s.expiresIn
    )

    currentSession.token = refreshToken
    currentSession.expiresIn =
      Date.now() + constants.jwt.exp_time.refresh * 1_000

    userConfig.set({
      sessions: [currentSession, ...filteredSessions]
    })
    await userConfig.save()

    return [accessToken, refreshToken]
  }

  static async sendOTP ({ email, len }) {
    const generatedOTP = generateOTP(len)

    const foundUser = await UserDAO.update({ email }, { otp: generatedOTP })

    // Sending OTP to user email
    const info = await EmailService.send({
      to: email,
      templateName: 'otp-request',
      context: { otp: generatedOTP.pin, expiresIn: 10 }
    })
    if (info.error) {
      throw new DependencyError('Error sending OTP to email.')
    }

    return foundUser
  }

  static async logout (token) {
    try {
      const userConfig = await userConfigService.getConfig({
        'sessions.token': token
      })

      userConfig.sessions = userConfig.sessions.filter(
        (s) => s.token !== token && Date.now() < s.expiresIn
      )
      await userConfig.save()
    } catch (exception) {
      logger.warn(exception.message)
    }
  }

  static async signOutAllSessions (userId, token) {
    const userConfig = await userConfigService.getConfig({ userId })

    // ! Prune refresh token array for expired refresh tokens.
    userConfig.sessions = userConfig.sessions.filter((s) => s.token !== token)
    await userConfig.save()

    return userConfig
  }
}

export default AuthService
