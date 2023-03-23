import { constants } from '../config'
import { httpCodes } from '../utils/constants'
import AuthService from '../services/auth.service'
import authValidator from '../validators/auth.validator'
import BaseController from './base.controller'
import ErrorResponse from '../utils/ErrorResponse'
import ValidationError from '../errors/ValidationError'
import requestIp from 'request-ip'
class AuthController extends BaseController {
  static verifyRegistration = async (req, res) => {
    const token = res.cookies?.jwt
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const { value, error } = authValidator.validateVerifyReg(req.body)
    if (error) throw new ValidationError(null, error)

    const [accessToken, refreshToken, user] = await AuthService.verifySignUp(
      value,
      token,
      req.headers['user-agent'],
      requestIp.getClientIp(req)
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
    if (error) throw new ValidationError(null, error)

    const [data, refreshToken] = await AuthService.login(
      value,
      token,
      req.headers['user-agent'],
      requestIp.getClientIp(req)
    )
    const response = this.apiResponse('Login successful.', data)

    //  ! Create secure cookie with refresh token.
    res.cookie('jwt', refreshToken.token, {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000
    })

    res.status(httpCodes.OK).json(response)
  }

  static getCurrentUser = async (req, res) => {
    const user = await AuthService.getCurrentUser(req.currentUser._id)
    const response = this.apiResponse('Fetched current user.', user)

    res.status(httpCodes.OK).json(response)
  }

  static getNewTokenSet = async (req, res) => {
    const token = req.cookies?.jwt
    if (!token) {
      return res.status(httpCodes.UNAUTHORIZED).json(
        new ErrorResponse({
          name: 'Auth Error',
          message: 'No refresh token provided.'
        })
      )
    }

    // Clear jwt cookie
    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const [accessToken, refreshToken] = await AuthService.getNewTokenSet(token, req.headers['user-agent'])

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
    if (error) throw new ValidationError(null, error)

    await AuthService.sendOTP(value)
    const response = this.apiResponse('OTP sent to email.')

    res.status(httpCodes.OK).json(response)
  }

  static logout = async (req, res) => {
    await AuthService.logout(req.cookies?.jwt)

    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const response = this.apiResponse('Logged out')
    res.status(httpCodes.NO_CONTENT).json(response)
  }

  static logoutAllSessions = async (req, res) => {
    await AuthService.logoutAllSessions(req.currentUser._id, req.cookies?.jwt)
    const response = this.apiResponse('Signed out of all devices.')

    res.status(httpCodes.OK).json(response)
  }

  static callback = (req, res) => {
    res.status(200).json(req.body)
  }
}

export default AuthController
