import LoanDAO from "../daos/loan.dao.js";

class LoanService {
  static async createLoan(dto, currentUser) {
    const newLoan = await LoanDAO.insert(dto);

    return newLoan;
  }

  static async getLoans(tenantId) {
    const foundLoans = await LoanDAO.find({ tenantId });
    const count = Intl.NumberFormat("en-US").format(foundLoans.length);

    return [count, foundLoans];
  }

  static async getLoan(loanId) {
    const foundLoan = await LoanDAO.findById(loanId);

    return foundLoan;
  }

  static async updateLoan(loanId, dto) {
    const updatedLoan = await LoanDAO.update(loanId, dto);

    return updatedLoan;
  }

  static async deleteLoan(customerId) {
    const deletedLoan = await LoanDAO.remove(customerId);

    return deletedLoan;
  }
}

export default LoanService;
