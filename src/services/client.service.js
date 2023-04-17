import ClientDAO from '../daos/client.dao.js'

class ClientService {
  static create = async (newClientDTO) => {
    const newPersonnel = await ClientDAO.insert(newClientDTO)

    return newPersonnel
  }

  static register = async (newClientSignupDTO) => {
    const newPersonnel = await ClientDAO.insert(newClientSignupDTO)

    return newPersonnel
  }

  static getClients = async (filter, projection) => {
    const foundLoanees = await ClientDAO.find(filter, projection)
    const count = Intl.NumberFormat('en-US').format(foundLoanees.length)

    return { count, foundLoanees }
  }

  static getClientById = async (clientId) => {
    const foundClient = await ClientDAO.findById(clientId)

    return foundClient
  }
}

export default ClientService
