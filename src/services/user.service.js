/* eslint-disable camelcase */
import events from '../pubsub/events'
import generateOTP from '../utils/generateOTP'
import mailer from '../utils/mailer'
import pubsub from '../pubsub/PubSub'
import UserDAO from '../daos/user.dao'
import UnauthorizedError from '../errors/UnauthorizedError'
import { constants } from '../config'
import similarity from '../utils/similarity'
import ValidationError from '../errors/ValidationError'
import { startSession } from 'mongoose'
import logger from '../utils/logger'
import generateRandomPwd from '../utils/generateRandomPwd'

class UserService {
  static async createUser (newUserDto, trx = null) {
    if (!trx) {
      trx = await startSession()

      // ! Start transaction.
      trx.startTransaction()
    }

    try {
      newUserDto.otp = generateOTP(10)
      newUserDto.password = generateRandomPwd()

      const newUser = await UserDAO.insert(newUserDto, trx)

      // * Emitting  new user sign up event.
      pubsub.publish(events.user.new, { ...newUser._doc })

      await mailer({
        to: newUser.email,
        subject: 'One more step',
        name: newUser.name.first,
        template: 'new-user',
        payload: { otp: newUserDto.otp.pin, password: newUserDto.password }
      })

      /**
       * * Email sent successful, commit changes.
       */
      await trx.commitTransaction()
      trx.endSession()

      delete newUser._doc.password
      delete newUser._doc.otp
      delete newUser._doc.queryName
      delete newUser._doc.refreshTokens
      delete newUser._doc.resetPwd

      return newUser
    } catch (exception) {
      /**
       * ! Exception thrown, roll back changes
       */
      await trx.abortTransaction()
      trx.endSession()

      throw exception
    }
  }

  static async getUsers (query = {}, projection = null) {
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
    const foundUsers = await UserDAO.findAll(query, projection)
    const count = Intl.NumberFormat('en-US').format(foundUsers.length)

    return { count, users: foundUsers }
  }

  static async getUserById (userId, projection = null) {
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
    const foundUser = await UserDAO.findById(userId, projection)

    return foundUser
  }

  static async getUserByField (query, projection = null) {
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
    if (!query) throw new Error('Query object is required.')

    const foundUser = await UserDAO.findByField(query, projection)

    return foundUser
  }

  static async updateUser (userId, updateUserDto, projection = null) {
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
    const updatedUser = await UserDAO.update(userId, updateUserDto, projection)

    return updatedUser
  }

  static async deleteUser (userId, projection = null) {
    projection = projection || {
      password: 0,
      resetPwd: 0,
      refreshTokens: 0,
      otp: 0
    }
    const deletedUser = await UserDAO.remove(userId, projection)

    await pubsub.publish(events.user.delete, { userId: deletedUser._doc._id })

    return deletedUser
  }

  static async changePassword (userId, updatePasswordDto) {
    const { current_password, new_password } = updatePasswordDto
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
    await mailer({
      to: foundUser.email,
      subject: 'Password changed',
      name: foundUser.name.first,
      template: 'password-changed'
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
    const randomPwd = generateRandomPwd()

    logger.info('Sending password reset mail...')
    await mailer({
      to: foundUser.email,
      subject: 'Password reset triggered',
      name: foundUser.name.first,
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
    const randomPwd = generateRandomPwd()

    logger.info('Sending password reset mail...')
    await mailer({
      to: foundUser.email,
      subject: 'Account reactivation',
      name: foundUser.name.first,
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
}

export default UserService
