import { constants } from '../config'
import { httpCodes } from '../utils/constants'
import AuthService from '../services/auth.service'
import authValidator from '../validators/auth.validator'
import BaseController from './base.controller'
import ValidationError from '../errors/ValidationError'
import UnauthorizedError from '../errors/UnauthorizedError'

class AuthController extends BaseController {
  static verifyRegistration = async (req, res) => {
    const token = res.cookies?.jwt
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const { value, error } = authValidator.validateVerifyReg(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const [accessToken, refreshToken, user] = await AuthService.verifySignUp(
      value,
      token
    )

    //  ! Create secure cookie with refresh token.
    res.cookie('jwt', refreshToken.token, {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000
    })

    const response = this.apiResponse('User verified.', { user, accessToken })

    return res.status(httpCodes.OK).json(response)
  }

  static login = async (req, res) => {
    const token = req.cookies?.jwt
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const { value, error } = authValidator.validateLogin(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const [data, refreshToken] = await AuthService.login(value, token)

    //  ! Create secure cookie with refresh token.
    res.cookie('jwt', refreshToken.token, {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000
    })
    const response = this.apiResponse('Login successful.', data)

    res.status(httpCodes.OK).json(response)
  }

  static getLoggedInUser = async (req, res) => {
    const user = await AuthService.getCurrentUser(req.currentUser.id)
    const response = this.apiResponse('Fetched current logged in user.', user)

    res.status(httpCodes.OK).json(response)
  }

  static getNewTokenSet = async (req, res) => {
    const token = req.cookies?.jwt
    if (!token) throw new UnauthorizedError('No refresh token provided.')

    // Clear jwt cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const [accessToken, refreshToken] = await AuthService.getNewTokenSet(
      token
    )

    //  ! Create secure cookie with refresh token.
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
    if (error) throw new ValidationError(error.message, error.path)

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

  static logoutAllSessions = async (req, res) => {
    await AuthService.logout(req.currentUser.id, req.cookies?.jwt)

    const response = this.apiResponse('Signed out of all devices.')

    res.status(httpCodes.OK).json(response)
  }
}

export default AuthController
