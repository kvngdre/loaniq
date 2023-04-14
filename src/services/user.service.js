/* eslint-disable camelcase */
import { constants } from '../config/index.js'
import { events, pubsub } from '../pubsub/index.js'
import { fileURLToPath } from 'url'
import {
  generateAccessToken,
  generateRefreshToken
} from '../utils/generateJWT.js'
import { startSession } from 'mongoose'
import ConflictError from '../errors/ConflictError.js'
import driverUploader from '../utils/driveUploader.js'
import fs from 'fs'
import generateSession from '../utils/generateSession.js'
import logger from '../utils/logger.js'
import mailer from '../utils/mailer.js'
import path from 'path'
import randomString from '../utils/randomString.js'
import similarity from '../utils/stringSimilarity.js'
import UnauthorizedError from '../errors/UnauthorizedError.js'
import userConfigService from './userConfig.service.js'
import UserDAO from '../daos/user.dao.js'
import ValidationError from '../errors/ValidationError.js'
class UserService {
  async createUser (newUserDTO) {
    // * Initializing transaction session.
    const trx = await startSession()
    try {
      trx.startTransaction()
      newUserDTO.password = randomString()

      const [newUser] = await Promise.all([
        UserDAO.insert(newUserDTO, trx),
        mailer({
          to: newUserDTO.email,
          subject: 'One more step',
          name: newUserDTO.first_name,
          template: 'new-user',
          payload: { password: newUserDTO.password }
        })
      ])

      // Emitting  new user event.
      await pubsub.publish(
        events.user.new,
        null,
        { userId: newUser._id, ...newUser._doc },
        trx
      )

      // Email sent successfully, committing changes.
      await trx.commitTransaction()
      newUser.purgeSensitiveData()

      return newUser
    } catch (exception) {
      // ! Exception thrown, roll back changes
      await trx.abortTransaction()

      throw exception
    } finally {
      trx.endSession()
    }
  }

  async verifyNewUser (verifyNewUserDTO, userAgent, clientIp) {
    const { email, current_password, new_password } = verifyNewUserDTO

    const foundUser = await UserDAO.findOne({ email })
    if (foundUser.isEmailVerified) {
      throw new ConflictError('User already verified, please sign in.')
    }

    const isMatch = foundUser.comparePasswords(current_password)
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.')

    // * Measuring similarity of new password to the current password.
    const similarityPercent = similarity(new_password, current_password) * 100
    if (similarityPercent >= constants.max_similarity) {
      throw new ValidationError('Password is too similar to old password.')
    }

    const userConfig = await userConfigService.getConfig({
      userId: foundUser._id
    })

    // Send welcome mail...
    // mailer({
    //   to: foundUser.email,
    //   subject: 'Welcome to Apex!',
    //   name: foundUser.first_name,
    //   template: 'new-tenant'
    // })

    const accessToken = generateAccessToken({ id: foundUser._id })
    const refreshToken = generateRefreshToken({ id: foundUser._id })
    const newSession = generateSession(userAgent, clientIp, refreshToken)

    await Promise.all([
      foundUser.updateOne({
        last_login_time: new Date(),
        isEmailVerified: true,
        password: new_password,
        active: true,
        resetPwd: false
      }),
      userConfig.updateOne({ sessions: [newSession, ...userConfig.sessions] })
    ])

    foundUser.purgeSensitiveData()

    return [accessToken, refreshToken, foundUser]
  }

  async getUsers (
    tenantId,
    projection = {
      password: 0,
      resetPwd: 0,
      otp: 0
    }
  ) {
    const foundUsers = await UserDAO.findAll({ tenantId }, projection)
    const count = Intl.NumberFormat('en-US').format(foundUsers.length)

    return { count, users: foundUsers }
  }

  async getUserById (
    id,
    projection = {
      password: 0,
      resetPwd: 0,
      otp: 0
    }
  ) {
    // console.log(id)
    const foundUser = await UserDAO.findById(id, projection)

    return foundUser
  }

  async getUser (
    filter,
    projection = {
      password: 0,
      resetPwd: 0,
      otp: 0
    }
  ) {
    const foundUser = await UserDAO.findOne(filter, projection)

    return foundUser
  }

  async getCurrentUser (userId) {
    const foundUser = await UserDAO.findById(userId)

    foundUser.purgeSensitiveData()

    return foundUser
  }

  async updateUser (
    userId,
    dto,
    projection = {
      password: 0,
      resetPwd: 0,
      otp: 0
    }
  ) {
    const updatedUser = await UserDAO.update(userId, dto, projection)

    return updatedUser
  }

  async updateBulk (filter, updateDTO) {
    const result = await UserDAO.updateMany(filter, updateDTO)

    return result
  }

  async deleteUser (userId) {
    const deletedUser = await UserDAO.remove(userId)

    await pubsub.publish(events.user.delete, deletedUser._id)

    return deletedUser
  }

  async updatePassword (userId, dto) {
    const { current_password, new_password } = dto
    const foundUser = await UserDAO.findById(userId)

    const isMatch = foundUser.comparePasswords(current_password)
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.')

    const percentageSimilarity =
      similarity(new_password, current_password) * 100

    if (percentageSimilarity >= constants.max_similarity) {
      throw new ValidationError('Password is too similar to old password.')
    }

    // ! Notify user of password change
    logger.debug('Sending password change email...')
    mailer({
      to: foundUser.email,
      subject: 'Password changed',
      name: foundUser.first_name,
      template: 'password-change'
    })

    foundUser.set({ password: new_password })
    await foundUser.save()

    foundUser.purgeSensitiveData()

    return foundUser
  }

  async forgotPassword ({ email, new_password }) {
    logger.info('Sending password change email...')
    const [user] = await Promise.all([
      UserDAO.update({ email }, { password: new_password, resetPwd: false }),
      mailer({
        to: email,
        subject: 'Password changed',
        template: 'password-change'
      })
    ])

    user.purgeSensitiveData()

    return user
  }

  async resetPassword (userId) {
    const randomPwd = randomString(6)

    const foundUser = await UserDAO.update(userId, {
      resetPwd: true,
      password: randomPwd
    })

    logger.info('Sending password reset mail...')
    await mailer({
      to: foundUser.email,
      subject: 'Password reset triggered',
      name: foundUser.first_name,
      template: 'password-reset',
      payload: { password: randomPwd }
    })

    foundUser.purgeSensitiveData()

    return foundUser
  }

  async deactivateUser (userId, { password }) {
    const foundUser = await UserDAO.findById(userId)

    const isMatch = foundUser.comparePasswords(password)
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.')

    pubsub.publish(events.user.resetPwd, { userId }, { sessions: [] })

    foundUser.set({ active: false, sessions: [] })
    await foundUser.save()
    // ? Should a notification email be sent to the user?

    foundUser.purgeSensitiveData()

    return foundUser
  }

  async reactivateUser (userId) {
    const foundUser = await UserDAO.update(userId, { active: true })

    foundUser.purgeSensitiveData()

    return foundUser
  }

  async uploadImage ({ userId, tenantId }, uploadFile) {
    const foundUser = await UserDAO.findById(userId, {
      password: 0,
      resetPwd: 0,
      otp: 0
    })
    const folderName = `t-${tenantId.toString()}`

    const [foundFolder] = await driverUploader.findFolder(folderName)

    // Selecting folder
    const folderId = foundFolder?.id
      ? foundFolder.id
      : await driverUploader.createFolder(folderName)

    // const newFolderId = await driverUploader.createFolder('users', folderId)

    const name = uploadFile.originalname
    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const filePath = path.resolve(__dirname, `../../${uploadFile.path}`)
    const mimeType = uploadFile.mimetype

    const response = await driverUploader.createFile(
      name,
      filePath,
      folderId,
      mimeType
    )
    logger.debug(response.data.id)

    foundUser.set({
      avatar: response.data.id
    })

    // ! Delete uploaded file from file system
    fs.unlinkSync(filePath)

    await foundUser.save()
    return foundUser
  }
}

export default new UserService()
