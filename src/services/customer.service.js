import CustomerDAO from '../daos/customer.dao'

class CustomerService {
  static async create (dto, trx) {
    const newCustomer = await CustomerDAO.insert(dto, trx)

    return newCustomer
  }

  static async getCustomers (tenantId) {
    const foundCustomers = await CustomerDAO.findAll({ tenantId })
    const count = Intl.NumberFormat('en-US').format(foundCustomers.length)

    return [count, foundCustomers]
  }

  static async getCustomer (customerId) {
    const foundCustomer = await CustomerDAO.findById(customerId)

    return foundCustomer
  }

  static async updateCustomer (customerId, dto) {
    const updatedCustomer = await CustomerDAO.update(customerId, dto)

    return updatedCustomer
  }

  static async deleteCustomer (customerId) {
    const deletedCustomer = await CustomerDAO.remove(customerId)

    return deletedCustomer
  }

  static async uploadFiles () {

  }
}

export default CustomerService
