import { constants } from '../config'
import BadRequestError from '../errors/BadRequestError'
import ValidationError from '../errors/ValidationError'
import AuthService from '../services/auth.service'
import APIResponse from '../utils/APIResponse'
import { httpCodes } from '../utils/constants'
import AuthValidator from '../validators/auth.validator'

class AuthController {
  static async verifyRegistration (req, res) {
    if (res.cookies?.jwt) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: constants.secure_cookie
      })
    }

    const { value, error } = AuthValidator.validateVerifyReg(req.body)
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
    const response = new APIResponse('User verified.', payload)

    return res.status(httpCodes.OK).json(response)
  }

  static async login (req, res) {
    if (res.cookies?.jwt) {
      res.clearCookie('jwt', {
        httpOnly: true,
        sameSite: 'None',
        secure: constants.secure_cookie
      })
    }

    const { value, error } = AuthValidator.validateLogin(req.body)
    if (error) throw new ValidationError(error.details[0].message)

    const payload = await AuthService.login(value, res.cookies?.jwt)
    res.cookie('jwt', payload.refreshToken.token, {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie,
      maxAge: constants.jwt.exp_time.refresh * 1000
    })

    const response = new APIResponse('Login successful.', payload)

    res.status(httpCodes.OK).json(response)
  }

  static async getNewTokenSet (req, res) {
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

    const response = new APIResponse('New token set generated.', {
      accessToken
    })

    res.status(httpCodes.OK).json(response)
  }

  static async logout (req, res) {
    AuthService.logout(req.cookie?.jwt)

    res.clearCookie('jwt', {
      httpOnly: true,
      sameSite: 'None',
      secure: constants.secure_cookie
    })

    const response = new APIResponse('User logged out')

    res.status(httpCodes.OK).json(response)
  }
}

// export default AuthController
