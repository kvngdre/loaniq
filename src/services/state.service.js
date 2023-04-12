import StateDAO from '../daos/state.dao.js'

class StateService {
  static async create(dto) {
    const newState = await StateDAO.insert(dto)

    return newState
  }

  static async getStates(filters) {
    const foundStates = await StateDAO.findAll(filters)
    const count = Intl.NumberFormat('en-US').format(foundStates.length)

    return [count, foundStates]
  }

  static async getState(stateId) {
    const foundState = await StateDAO.findById(stateId)

    return foundState
  }

  static async update(stateId, dto) {
    const updatedState = await StateDAO.update(stateId, dto)

    return updatedState
  }

  static async delete(stateId) {
    const deletedState = await StateDAO.remove(stateId)

    return deletedState
  }
}

export default StateService
