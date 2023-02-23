import { tenant } from '../pubsub/events'
import { subscribe } from '../pubsub/PubSub'
import { insert } from '../daos/user.dao'

class UserService {
  constructor () {
    subscribe(tenant.signUp, this.createUser)
  }

  async createUser (newUserDto, trx) {
    const newUser = await insert(newUserDto, trx)

    return newUser
  }
}

export default new UserService()
