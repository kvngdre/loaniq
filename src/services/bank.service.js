import BankDAO from '../daos/bank.dao.js'

class BankService {
  static async create(dto) {
    const newBank = await BankDAO.insert(dto)

    return newBank
  }

  static async getBanks(filter) {
    const foundBanks = await BankDAO.findAll(filter)
    const count = Intl.NumberFormat('en-US').format(foundBanks.length)

    return [count, foundBanks]
  }

  static async getBank(bankId) {
    const foundBank = await BankDAO.findById(bankId)

    return foundBank
  }

  static async updateBank(bankId, dto) {
    const updatedBank = await BankDAO.update(bankId, dto)

    return updatedBank
  }

  static async deleteBank(bankId) {
    const deletedBank = await BankDAO.remove(bankId)

    return deletedBank
  }
}

export default BankService
