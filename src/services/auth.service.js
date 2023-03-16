/* eslint-disable camelcase */
import { constants } from '../config'
import { generateOTP, similarity, validateOTP } from '../helpers'
import ConflictError from '../errors/ConflictError'
import events from '../pubsub/events'
import ForbiddenError from '../errors/ForbiddenError'
import jwt from 'jsonwebtoken'
import logger from '../utils/logger'
import mailer from '../utils/mailer'
import pubsub from '../pubsub/pubsub'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserService from './user.service'
import ValidationError from '../errors/ValidationError'

class AuthService {
  static async verifySignUp (dto, token) {
    const { email, otp, current_password, new_password } = dto

    const foundUser = await UserService.getUser({ email }, {})
    if (foundUser.active) {
      throw new ConflictError('User already verified, please sign in.')
    }

    const isMatch = await foundUser.comparePasswords(current_password)
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.')

    validateOTP(foundUser, otp)

    // * Measuring similarity of new password to the current password.
    const percentageSimilarity =
      similarity(new_password, current_password) * 100
    const similarityThreshold = constants.max_similarity
    if (percentageSimilarity >= similarityThreshold) {
      throw new ValidationError('Password is too similar to old password.')
    }

    if (token) {
      // ! Prune user refresh tokens array for expired tokens.
      foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (rt) => rt.token !== token && Date.now() < rt.expires
      )
    }
    // * Generating new token set.
    const accessToken = foundUser.generateAccessToken()
    const refreshToken = foundUser.generateRefreshToken()

    foundUser.refreshTokens.push(refreshToken)
    foundUser.set({
      isEmailVerified: true,
      password: new_password,
      'otp.pin': null,
      'otp.expires': null,
      active: true,
      resetPwd: false
    })
    await foundUser.save()

    // ! Emitting user login event.
    pubsub.publish(events.user.login, { user: foundUser._id })

    delete foundUser._doc.password
    delete foundUser._doc.otp
    delete foundUser._doc.refreshTokens

    return [accessToken, refreshToken, foundUser]
  }

  static async login ({ email, password }, token) {
    const foundUser = await UserService.getUser({ email }, {}).catch(() => {
      throw new UnauthorizedError('Invalid credentials.')
    })

    const isMatch = await foundUser.comparePasswords(password)
    if (!isMatch) throw new UnauthorizedError('Invalid credentials.')

    permitLogin(foundUser)
    function permitLogin (user) {
      const data = {
        id: user._id,
        accessToken: null,
        redirect: {}
      }

      if (!user.isEmailVerified && !user.active) {
        data.redirect.verify_registration = true
        throw new ForbiddenError('Your account has not been confirmed.', data)
      }

      if (user.resetPwd) {
        data.redirect.reset_password = true
        throw new ForbiddenError(
          'Your password reset has been triggered.',
          data
        )
      }

      if (!user.active) {
        data.redirect = null
        throw new ForbiddenError(
          'Account deactivated. Contact your administrator.',
          data
        )
      }
    }

    if (token) {
      // ! Prune user refresh tokens array for expired tokens.
      foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (rt) => rt.token !== token && Date.now() < rt.expires
      )

      /**
       * * Scenario simulated here:
       * * 1) User logs in, never uses the refresh token and does not logout.
       * * 2) The refresh token gets stolen
       * * 3) if 1 & 2, reuse detection is needed to clear all RTs when user logs in.
       */
      await UserService.getUser(
        {
          refreshTokens: { $elemMatch: { token } }
        },
        {}
      ).catch(() => {
        /**
         * ! Refresh token reuse detected.
         * * Purge user refresh token array.
         */
        foundUser.set({ refreshTokens: [] })
      })
    }

    // * Generating new token set.
    const accessToken = foundUser.generateAccessToken()
    const refreshToken = foundUser.generateRefreshToken()

    foundUser.refreshTokens.push(refreshToken)
    await foundUser.save()

    // ! Emitting user login event.
    pubsub.publish(events.user.login, { user: foundUser._id })

    return [
      { id: foundUser._id, role: foundUser.role, accessToken, redirect: null },
      refreshToken
    ]
  }

  static async getCurrentUser (userId) {
    const foundUser = await UserService.getUserById(userId)

    return foundUser
  }

  static async getNewTokenSet (token) {
    try {
      const foundUser = await UserService.getUser(
        {
          refreshTokens: { $elemMatch: { token } }
        },
        {}
      ).catch((err) => {
        // ! Refresh token reuse detected.
        logger.fatal('Refresh token reuse detected', err.stack)
        const decoded = jwt.verify(token, constants.jwt.secret.refresh)

        UserService.getUserById(decoded.id)
          .then(async (foundUser) => {
            await foundUser.updateOne({ refreshTokens: [] })
          })
          .catch(() => {})

        throw new ForbiddenError('Forbidden')
      })

      const { id, iss, aud } = jwt.verify(token, constants.jwt.secret.refresh)
      const { issuer, audience } = constants.jwt
      if (
        // Validating token
        id !== foundUser._id.toString() ||
        iss !== issuer ||
        aud !== audience
      ) {
        throw new ForbiddenError('Invalid token')
      }

      // Generate new token set
      const accessToken = foundUser.generateAccessToken()
      const refreshToken = foundUser.generateRefreshToken()

      // ! Prune refresh token array for expired refresh tokens.
      foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (rt) => rt.token !== token && Date.now() < rt.expires
      )

      // Updating user refresh token array
      foundUser.refreshTokens.push(refreshToken)
      await foundUser.save()

      return [accessToken, refreshToken]
    } catch (exception) {
      logger.error(exception.message, exception.stack)
      throw new ForbiddenError(exception.message)
    }
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
    try {
      const foundUser = await UserService.getUser(
        {
          refreshTokens: { $elemMatch: { token } }
        },
        {}
      )

      foundUser.refreshTokens = foundUser.refreshTokens.filter(
        (rt) => rt.token !== token && Date.now() < rt.expires
      )
      await foundUser.save()

      return [200, 'User logged out']
    } catch (exception) {
      return [204, null]
    }
  }

  static async logoutAllSessions (userId, token) {
    const foundUser = await UserService.getUserById(userId, {})

    // ! Prune refresh token array for expired refresh tokens.
    foundUser.refreshTokens = foundUser.refreshTokens.filter(
      (rt) => rt.token !== token
    )
    await foundUser.save()

    return foundUser
  }
}

export default AuthService
