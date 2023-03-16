/* eslint-disable camelcase */
import { constants, roles } from '../config'
import { flatten, genRandomStr, generateOTP, similarity } from '../helpers'
import { startSession } from 'mongoose'
import { events, pubsub } from '../pubsub'
import driverUploader from '../utils/driveUploader'
import fs from 'fs'
import logger from '../utils/logger'
import mailer from '../utils/mailer'
import path from 'path'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserDAO from '../daos/user.dao'
import ValidationError from '../errors/ValidationError'
import ForbiddenError from '../errors/ForbiddenError'

class UserService {
  static async createUser (dto, trx) {
    // * Initializing transaction session.
    const txn = !trx ? await startSession() : null
    try {
      dto.otp = generateOTP(10)
      dto.password = genRandomStr(6)

      // ! Starting transaction.
      txn?.startTransaction()

      const newUser = await UserDAO.insert(dto, trx || txn)

      // * Emitting  new user event.
      pubsub.publish(
        events.user.new,
        null,
        { userId: newUser._id, ...newUser._doc },
        trx || txn
      )

      await mailer({
        to: newUser.email,
        subject: 'One more step',
        name: newUser.first_name,
        template: 'new-user',
        payload: { otp: dto.otp.pin, password: dto.password }
      })

      // * Email sent successfully, committing changes.
      await txn?.commitTransaction()
      txn?.endSession()

      delete newUser._doc.password
      delete newUser._doc.otp
      delete newUser._doc.refreshTokens
      delete newUser._doc.resetPwd

      return newUser
    } catch (exception) {
      // ! Exception thrown, roll back changes
      await txn?.abortTransaction()
      txn?.endSession()

      throw exception
    }
  }

  static async getUsers (
    currentUser,
    projection = {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
  ) {
    const filter = { tenantId: currentUser.tenantId }

    const foundUsers = await UserDAO.findAll(filter, projection)
    const count = Intl.NumberFormat('en-US').format(foundUsers.length)

    return { count, users: foundUsers }
  }

  static async getUserById (
    userId,
    projection = {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
  ) {
    const foundUser = await UserDAO.findById(userId, projection)

    return foundUser
  }

  static async getUser (
    filter,
    projection = {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
  ) {
    if (!filter) throw new Error('Filter is required.')

    const foundUser = await UserDAO.findOne(filter, projection)

    return foundUser
  }

  static async updateUser (
    userId,
    dto,
    projection = {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
  ) {
    const updatedUser = await UserDAO.update(userId, dto, projection)
    return updatedUser
  }

  static async updateUsers (filter, dto) {
    await UserDAO.updateMany(filter, dto)
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
    const similarityThreshold = constants.max_similarity
    if (percentageSimilarity >= similarityThreshold) {
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

    delete foundUser._doc.password
    delete foundUser._doc.otp
    delete foundUser._doc.refreshTokens
    delete foundUser._doc.resetPwd

    return foundUser
  }

  static async forgotPassword (dto) {
    const { email, new_password } = dto
    const foundUser = await UserDAO.findOne({ email })

    foundUser.set({ password: new_password })
    await foundUser.save()

    // ! Notify user of password change.
    logger.info('Sending password change email...')
    mailer({
      to: foundUser.email,
      subject: 'Password changed',
      name: foundUser.first_name,
      template: 'password-change'
    })

    delete foundUser._doc.password
    delete foundUser._doc.otp
    delete foundUser._doc.refreshTokens
    delete foundUser._doc.resetPwd

    return foundUser
  }

  static async resetPassword (userId) {
    const foundUser = await UserDAO.findById(userId)

    const randomPwd = genRandomStr(6)

    logger.info('Sending password reset mail...')
    await mailer({
      to: foundUser.email,
      subject: 'Password reset triggered',
      name: foundUser.first_name,
      template: 'password-reset',
      payload: { password: randomPwd }
    })

    foundUser.set({
      resetPwd: true,
      password: randomPwd,
      refreshTokens: []
    })
    await foundUser.save()

    delete foundUser._doc.otp
    delete foundUser._doc.refreshTokens
    delete foundUser._doc.resetPwd
    foundUser._doc.password = randomPwd

    return foundUser
  }

  static async deactivateUser (currentUser, userId) {
    const foundUser = await UserDAO.findById(userId, {
      password: 0,
      refreshTokens: 0,
      otp: 0,
      resetPwd: 0
    })

    if (
      currentUser.role !== roles.SUPER_ADMIN &&
      foundUser.role === roles.DIRECTOR
    ) {
      throw new ForbiddenError(
        'You do not have sufficient permissions to perform this action.'
      )
    }

    foundUser.set({
      active: false,
      refreshTokens: []
    })
    await foundUser.save()
    // ? Should a notification email be sent to the user?

    return foundUser
  }

  static async reactivateUser (currentUser, userId) {
    const foundUser = await UserDAO.findById(userId)
    if (
      currentUser.role !== roles.SUPER_ADMIN &&
      foundUser.role === roles.DIRECTOR
    ) {
      throw new ForbiddenError(
        'You do not have sufficient permissions to perform this action.'
      )
    }

    const generatedOTP = generateOTP(10)
    const randomPwd = genRandomStr(6)

    // todo Create reactivate email template
    logger.info('Sending account reactivation mail...')
    await mailer({
      to: foundUser.email,
      subject: 'Account reactivation initiated',
      name: foundUser.first_name,
      template: 'password-reset',
      payload: { otp: generatedOTP.pin, password: randomPwd }
    })

    foundUser.set({
      active: true,
      resetPwd: true,
      otp: generatedOTP,
      password: randomPwd,
      refreshTokens: []
    })
    await foundUser.save()

    delete foundUser._doc.password
    delete foundUser._doc.otp
    delete foundUser._doc.refreshTokens
    delete foundUser._doc.resetPwd

    return foundUser
  }

  static async uploadImage ({ userId, tenantId }, uploadFile) {
    const foundUser = await UserDAO.findById(userId, {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
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
