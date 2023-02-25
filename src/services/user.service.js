import events from '../pubsub/events'
import pubsub from '../pubsub/PubSub'
import UserDAO from '../daos/user.dao'

class UserService {
  static async createUser (newUserDto, trx) {
    const newUser = await UserDAO.insert(newUserDto, trx)

    pubsub.publish(events.user.new, { ...newUser._doc })

    return newUser
  }

  static async getUsers(query = {}, projection = {}) {
    const foundUsers = await UserDAO.findAll(query, projection)
    const count = Intl.NumberFormat('en-US').format(foundUsers.length)

    return { count, foundUsers }
  }

  static async getUser(userId, projection = {}) {
    const foundUser = await UserDAO.findById(userId, projection)

    return foundUser
  }

  static async updateUser(userId, updateUserDto, projection = {}) {
    const updatedUser = await UserDAO.update(userId, updateUserDto, projection)

    return updatedUser
  }

  static async deleteUser(userId, projection = {}) {
    const deletedUser = await UserDAO.remove(userId, projection)

    return deletedUser
  }
}

export default new UserService()
