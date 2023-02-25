// import events from '../pubsub/events'
// import pubsub from '../pubsub/PubSub'
import UserDAO from '../daos/user.dao'

class UserService {
  static async createUser (newUserDto, trx) {
    const newUser = await UserDAO.insert(newUserDto, trx)

    return newUser
  }

  static async getUsers () {
    const foundUsers = await UserDAO.findAll()
    const count = Intl.NumberFormat('en-US').format(foundUsers.length)

    return { count, foundUsers }
  }

  static async getUser (userId) {
    const foundUser = await UserDAO.findById(userId)

    return foundUser
  }

  static async updateUser (userId, updateUserDto) {
    const updatedUser = await UserDAO.update(userId, updateUserDto)

    return updatedUser
  }
}

export default new UserService()
