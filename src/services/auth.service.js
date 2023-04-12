/* eslint-disable camelcase */
/* eslint-disable eqeqeq */
import { constants } from '../config/index.js'
import { generateAccessToken, generateRefreshToken } from '../utils/generateJWT.js'
import ConflictError from '../errors/ConflictError.js'
import ForbiddenError from '../errors/ForbiddenError.js'
import generateOTP from '../utils/generateOTP.js'
import generateSession from '../utils/generateSession.js'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger.js'
import mailer from '../utils/mailer.js'
import UnauthorizedError from '../errors/UnauthorizedError.js'
import userConfigService from './userConfig.service.js'
import UserService from './user.service.js'

class AuthService {
  static async login({ email, password }, token, userAgent, clientIp) {
    const user = await UserService.getUser({ email }, {}).catch(() => {
      throw new UnauthorizedError('Invalid credentials')
    })

    const isMatch = user.comparePasswords(password)
    if (!isMatch) throw new UnauthorizedError('Invalid credentials')

    const { isGranted, message, data } = user.permitLogin()
    if (!isGranted) throw new ForbiddenError(message, data)

    const userConfig = await userConfigService.getConfig({ userId: user._id })

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

    if (userConfig.sessions.length === 3) {
      throw new ConflictError('Maximum allowed devices reached.')
    }

    const accessToken = generateAccessToken({ id: user._id })
    const refreshToken = generateRefreshToken({ id: user._id })
    const newSession = generateSession(userAgent, clientIp, refreshToken)

    await Promise.all([
      user.updateOne({ last_login_time: new Date() }),
      userConfig.updateOne({ sessions: [newSession, ...userConfig.sessions] })
    ])

    user.purgeSensitiveData()

    return [{ user, accessToken, redirect: null }, refreshToken]
  }

  static async getNewTokens(token) {
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

  static async sendOTP({ email, len }) {
    const generatedOTP = generateOTP(10, len)

    // TODO: pass the time to live of the otp to the mail.
    const [user] = await Promise.all([
      UserService.updateUser({ email }, { otp: generatedOTP }),
      mailer({
        to: email,
        subject: `Your one-time-pin: ${generatedOTP.pin}`,
        template: 'otp-request',
        payload: { otp: generatedOTP.pin }
      })
    ])

    return user
  }

  static async logout(token) {
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

  static async signOutAllSessions(userId, token) {
    const userConfig = await userConfigService.getConfig({ userId })

    // ! Prune refresh token array for expired refresh tokens.
    userConfig.sessions = userConfig.sessions.filter((s) => s.token !== token)
    await userConfig.save()

    return userConfig
  }
}

export default AuthService
