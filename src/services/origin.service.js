import OriginDAO from '../daos/origin.dao.js'

class OriginService {
  async create(newPersonnelDTO) {
    const newPersonnel = await OriginDAO.insert(newPersonnelDTO)

    return newPersonnel
  }

  async getMany(filter, projection) {
    const foundLoanees = await OriginDAO.findAll(filter, projection)
    const count = Intl.NumberFormat('en-US').format(foundLoanees.length)

    return { count, foundLoanees }
  }

  async getLoaneeById(id) {
    const foundLoanee = await OriginDAO.findById(id)

    return foundLoanee
  }
}

export default new OriginService()
