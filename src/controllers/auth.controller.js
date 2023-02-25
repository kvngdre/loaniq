import { constants } from '../config'
import { httpCodes } from '../utils/constants'
import AuthService from '../services/auth.service'
import authValidator from '../validators/auth.validator'
import BadRequestError from '../errors/BadRequestError'
import BaseController from './base.controller'
import ValidationError from '../errors/ValidationError'

class AuthController extends BaseController {
  static verifyRegistration = async (req, res) => {
    if (res.cookies?.jwt) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: constants.secure_cookie
      })
    }

    const { value, error } = authValidator.validateVerifyReg(req.body)
    if (error) throw new ValidationError(error.details[0].message)

    const { accessToken, refreshToken, user } =
      await AuthService.verifyRegistration(value, res.cookies?.jwt)

    res.cookie('jwt', refreshToken.token, {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000
    })

    const payload = { user, accessToken }
    const response = this.apiResponse('User verified.', payload)

    return res.status(httpCodes.OK).json(response)
  }

  static login = async (req, res) => {
    if (res.cookies?.jwt) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: constants.secure_cookie
      })
    }

    const { value, error } = authValidator.validateLogin(req.body)
    if (error) throw new ValidationError(error.details[0].message)

    const [message, payload, refreshToken] = await AuthService.login(
      value,
      res.cookies?.jwt
    )

    if (refreshToken) {
      res.cookie('jwt', refreshToken.token, {
        httpOnly: true,
        sameSite: 'None',
        secure: constants.secure_cookie,
        maxAge: constants.jwt.exp_time.refresh * 1000
      })
    }
    const response = this.apiResponse(message, payload)

    res.status(httpCodes.OK).json(response)
  }

  static getNewTokenSet = async (req, res) => {
    if (!req.cookies?.jwt) throw new BadRequestError('No refresh token found.')
    const token = req.cookies?.jwt

    // Clear jwt cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const { accessToken, refreshToken } = await AuthService.getNewTokenSet(
      token
    )

    // Setting new refresh token cookie
    res.cookie('jwt', refreshToken.token, {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000
    })

    const response = this.apiResponse('New token set generated.', {
      accessToken
    })

    res.status(httpCodes.OK).json(response)
  }

  static sendOTP = async (req, res) => {
    const { value, error } = authValidator.validateSendOTP(req.query)
    if (error) throw new ValidationError(error.details[0].message)

    await AuthService.sendOTP(value)
    const response = this.apiResponse('OTP sent to email.')

    res.status(httpCodes.OK).json(response)
  }

  static logout = async (req, res) => {
    const [httpCode, message] = await AuthService.logout(req.cookies?.jwt)

    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const response = this.apiResponse(message)
    res.status(httpCode).json(response)
  }
}

export default AuthController
