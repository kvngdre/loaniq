/* eslint-disable camelcase */
import { constants } from '../config'
import { genRandomStr, generateOTP, similarity } from '../helpers'
import { startSession } from 'mongoose'
import driverUploader from '../utils/driveUploader'
import events from '../pubsub/events'
import fs from 'fs'
import logger from '../utils/logger'
import mailer from '../utils/mailer'
import path from 'path'
import pubsub from '../pubsub'
import UnauthorizedError from '../errors/UnauthorizedError'
import UserDAO from '../daos/user.dao'
import ValidationError from '../errors/ValidationError'

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

  static async getUsers (filter, projection) {
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
    const foundUsers = await UserDAO.findAll(filter, projection)
    const count = Intl.NumberFormat('en-US').format(foundUsers.length)

    return { count, users: foundUsers }
  }

  static async getUserById (userId) {
    const projection = {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
    const foundUser = await UserDAO.findById(userId, projection)

    return foundUser
  }

  static async getUserByField (filter, projection) {
    if (!filter) throw new Error('Filter is required.')
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }

    const foundUser = await UserDAO.findByField(filter, projection)

    return foundUser
  }

  static async updateUser (userId, dto, projection) {
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
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

    /**
     * ! Notify user of password change
     */
    logger.info('Sending password change email...')
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

  static async resetPassword (userId) {
    const foundUser = await UserDAO.findById(userId)

    const generatedOTP = generateOTP(10)
    const randomPwd = genRandomStr(6)

    logger.info('Sending password reset mail...')
    await mailer({
      to: foundUser.email,
      subject: 'Password reset triggered',
      name: foundUser.first_name,
      template: 'password-reset',
      payload: { otp: generatedOTP.pin, password: randomPwd }
    })

    foundUser.set({
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

  static async deactivateUser (userId) {
    const deactivatedUser = await UserDAO.update(
      userId,
      {
        active: false,
        refreshTokens: []
      },
      { password: 0, refreshTokens: 0, otp: 0, resetPwd: 0 }
    )

    return deactivatedUser
  }

  static async reactivateUser (userId) {
    const foundUser = await UserDAO.findById(userId)

    const generatedOTP = generateOTP(10)
    const randomPwd = genRandomStr(6)

    logger.info('Sending password reset mail...')
    await mailer({
      to: foundUser.email,
      subject: 'Account reactivation',
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

  static async uploadImage ({ id, tenantId }, uploadFile) {
    const foundUser = await UserDAO.findById(id, {
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
