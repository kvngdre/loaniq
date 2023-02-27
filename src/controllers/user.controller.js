import { httpCodes } from '../utils/constants'
import BaseController from './base.controller'
import UserService from '../services/user.service'
import userValidator from '../validators/user.validator'
import ValidationError from '../errors/ValidationError'

class UserController extends BaseController {
  static createUser = async (req, res) => {
    const { value, error } = userValidator.validateCreate(
      req.body,
      req.currentUser
    )
    console.log(value)
    if (error) throw new ValidationError(error.message, error.path)
    return res.send('OK').end()

    const newUser = await UserService.createUser(value)
    const response = this.apiResponse(
      'User created. Password & OTP sent to user email.',
      newUser
    )

    res.status(httpCodes.CREATED).json(response)
  }

  static getUsers = async (req, res) => {
    const { count, users } = await UserService.getUsers()

    const message = this.getMsgFromCount(count)
    const response = this.apiResponse(message, users)

    res.status(httpCodes.OK).json(response)
  }

  static getUser = async (req, res) => {
    const user = await UserService.getUserById(req.params.userId)
    const response = this.apiResponse('Fetched user.', user)

    res.status(httpCodes.OK).json(response)
  }

  static updateUser = async (req, res) => {
    const { value, error } = userValidator.validateUpdate(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    const user = await UserService.updateUser(req.params.userId, value)
    const response = this.apiResponse('User account update.', user)

    res.status(httpCodes.OK).json(response)
  }

  static deleteUser = async (req, res) => {
    await UserService.deleteUser(req.params.userId)
    const response = this.apiResponse('User account deleted.')

    res.status(httpCodes.OK).json(response)
  }

  static changePassword = async (req, res) => {
    const { value, error } = userValidator.validateChangePassword(req.body)
    if (error) throw new ValidationError(error.message, error.path)

    await UserService.changePassword(req.params.userId, value)
    const response = this.apiResponse('Password updated.')

    res.status(httpCodes.OK).json(response)
  }

  static resetPassword = async (req, res) => {
    await UserService.resetPassword(req.params.userId)
    const response = this.apiResponse('User password has been reset.')

    res.status(httpCodes.OK).json(response)
  }

  // todo Discuss with Vic your ideas on forgot password flow.
  static forgotPassword = async (req, res) => {
    await UserService.resetPassword(req.params.userId)
    const response = this.apiResponse('User password has been reset.')

    res.status(httpCodes.OK).json(response)
  }

  static deactivateUser = async (req, res) => {
    await UserService.deactivateUser(req.params.userId)
    const response = this.apiResponse('User account deactivated.')

    res.status(httpCodes.OK).json(response)
  }

  static reactivateUser = async (req, res) => {
    await UserService.reactivateUser(req.params.userId)
    const response = this.apiResponse('User account has been reactivated.')

    res.status(httpCodes.OK).json(response)
  }
}

export default UserController
