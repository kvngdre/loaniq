/* eslint-disable camelcase */
import { constants } from '../config'
import { events, pubsub } from '../pubsub'
import { genRandomStr } from '../helpers/universal.helpers'
import { similarity } from '../helpers/user.helpers'
import { startSession } from 'mongoose'
import driverUploader from '../utils/driveUploader'
import fs from 'fs'
import logger from '../utils/logger'
import mailer from '../utils/mailer'
import path from 'path'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserDAO from '../daos/user.dao'
import ValidationError from '../errors/ValidationError'

class UserService {
  static async createUser (dto, trx) {
    // * Initializing transaction session.
    const txn = !trx ? await startSession() : null
    try {
      // ! Starting transaction.
      txn?.startTransaction()

      dto.password = genRandomStr(6)
      const newUser = await UserDAO.insert(dto, txn || trx)

      // Emitting  new user event.
      pubsub.publish(
        events.user.new,
        null,
        { userId: newUser._id, ...newUser._doc },
        txn || trx
      )

      await mailer({
        to: newUser.email,
        subject: 'One more step',
        name: newUser.first_name,
        template: 'new-user',
        payload: { password: dto.password }
      })

      // Email sent successfully, committing changes.
      await txn?.commitTransaction()
      txn?.endSession()

      newUser.purgeSensitiveData()

      return newUser
    } catch (exception) {
      // ! Exception thrown, roll back changes
      await txn?.abortTransaction()
      txn?.endSession()

      throw exception
    }
  }

  static async getUsers (
    tenantId,
    projection = {
      password: 0,
      resetPwd: 0,
      otp: 0,
      sessions: 0
    }
  ) {
    const foundUsers = await UserDAO.findAll({ tenantId }, projection)
    const count = Intl.NumberFormat('en-US').format(foundUsers.length)

    return { count, users: foundUsers }
  }

  static async getUserById (userId, projection) {
    const foundUser = await UserDAO.findById(userId, projection)

    foundUser.purgeSensitiveData()

    return foundUser
  }

  static async getUser (filter, projection) {
    const foundUser = await UserDAO.findOne(filter, projection)

    foundUser.purgeSensitiveData()

    return foundUser
  }

  static async updateUser (userId, dto, projection) {
    const updatedUser = await UserDAO.update(userId, dto, projection)

    updatedUser.purgeSensitiveData()

    return updatedUser
  }

  static async deleteUser (userId) {
    const deletedUser = await UserDAO.remove(userId)

    await pubsub.publish(events.user.delete, deletedUser._id)

    return deletedUser
  }

  static async changePassword (userId, dto) {
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

  static async forgotPassword (dto) {
    const { email, new_password } = dto
    const foundUser = await UserDAO.findOne({ email })

    foundUser.set({ password: new_password, resetPwd: false })
    await foundUser.save()

    // ! Notify user of password change.
    logger.info('Sending password change email...')
    mailer({
      to: foundUser.email,
      subject: 'Password changed',
      name: foundUser.first_name,
      template: 'password-change'
    })

    foundUser.purgeSensitiveData()

    return foundUser
  }

  static async resetPassword (userId) {
    const randomPwd = genRandomStr(6)

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

  static async deactivateUser (userId, { password }) {
    const foundUser = await UserDAO.findById(userId)

    const isMatch = foundUser.comparePasswords(password)
    if (!isMatch) throw new UnauthorizedError('Password is incorrect.')

    pubsub.publish(events.user.resetPwd, { userId }, { sessions: [] })

    foundUser.set({ active: false, sessions: [] })
    await foundUser.save()
    // ? Should a notification email be sent to the user?

    return foundUser
  }

  static async reactivateUser (userId) {
    const foundUser = await UserDAO.update(userId, { active: true })

    foundUser.purgeSensitiveData()

    return foundUser
  }

  static async uploadImage ({ userId, tenantId }, uploadFile) {
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

export default UserService
