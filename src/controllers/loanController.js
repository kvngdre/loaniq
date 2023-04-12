// import _ from 'lodash'
// import { DateTime } from 'luxon'
// import { roles, txnStatus, loanStatus } from '../utils/constants'
// import { get } from '../config'
// import Customer, { findById, findOne } from '../models/customer.model'
// import { findById as _findById } from '../models/tenant.model'
// import Loan, {
//   findOne as _findOne,
//   aggregate,
//   findById as __findById
// } from '../models/loan.model'
// import LoanValidator from '../validators/loanValidator'
// import { startSession, isValidObjectId } from 'mongoose'
// import PendingEdit from '../models/review.model'
// import { computeAge, computeTenure, flatten, pickRandomUser } from '../helpers'
// import Segment from '../models/segment.model'
// import ServerError from '../errors/serverError'
// import Transaction from '../models/transaction.model'
// const debug = require('debug')('app:loanCtrl')
// const logger = require('../utils/logger')

// // get loan validator
// async function getValidator (lender, segment) {
//   try {
//     const { segments } = lender

//     const isMatch = (seg) => seg.id._id.toString() === segment
//     const foundSegment = segments.find(isMatch)
//     if (!foundSegment) { return new ServerError(404, 'Segment configuration not found') }

//     const isNull = (key) => foundSegment[key] === undefined
//     if (Object.keys(foundSegment).some(isNull)) { return new ServerError(424, 'Missing some segment parameters.') }

//     const loanValidator = new LoanValidator(
//       foundSegment.minNetPay,
//       foundSegment.minLoanAmount,
//       foundSegment.maxLoanAmount,
//       foundSegment.minTenor,
//       foundSegment.maxTenor,
//       foundSegment.interestRate,
//       foundSegment.upfrontFeePercent,
//       foundSegment.transferFee,
//       foundSegment.maxDti
//     )

//     return loanValidator
//   } catch (exception) {
//     logger.error({
//       method: 'get_validator',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return exception
//   }
// }

// export async function create (user, customerPayload, loanPayload) {
//   const session = await startSession()
//   session.startTransaction()
//   try {
//     const foundLender = await _findById(user.lender).populate({
//       path: 'segments.id',
//       model: Segment
//     })
//     if (!foundLender) return new ServerError(404, 'Tenant not found')
//     if (!foundLender.active) { return new ServerError(404, 'Tenant is yet to be activated') }

//     // setting customer
//     const customer = await getCustomer(customerPayload)
//     async function getCustomer (payload) {
//       // is mongo object id
//       if (isValidObjectId(payload)) {
//         const foundCustomer = await findById(payload)
//         if (!foundCustomer) { throw new ServerError(404, 'Customer not found') }

//         return foundCustomer
//       }

//       // not an object id, check if customer exists
//       const foundCustomer = await findOne({
//         ippis: payload.ippis,
//         tenantId: user.lender
//       })
//       // customer found
//       if (foundCustomer) return foundCustomer

//       // customer not found, create new customer
//       const newCustomer = new Customer(payload)

//       // run new customer document validation
//       const customerError = newCustomer.validateSync()
//       if (customerError) {
//         const msg =
//                     customerError.errors[Object.keys(customerError.errors)[0]]
//                       .message
//         throw new ServerError(400, msg)
//       }
//       return newCustomer
//     }

//     // getting loan validators
//     if (user.role === roles.agent) loanPayload.agent = user.id
//     const loanValidators = await getValidator(
//       foundLender,
//       customer.employer.segment
//     )
//     if (loanValidators instanceof Error) {
//       debug(loanValidators)
//       return new ServerError(
//         500,
//                 `Error fetching segment parameters: ${loanValidators.message}`
//       )
//     }

//     // validating loan
//     const { value, error } = loanValidators.create(loanPayload)
//     if (error) return new ServerError(400, error.details[0].message)

//     // pick agent if not assigned one
//     if (!value.agent) value.agent = await pickAgent()
//     async function pickAgent () {
//       // pick from existing active loan
//       const foundLoan = await _findOne({
//         lender: customer.tenantId,
//         customer: customer._id,
//         active: true
//       }).populate({
//         path: 'customer',
//         model: Customer
//       })
//       // loan found
//       if (foundLoan) return foundLoan.agent

//       // no active loan. Pick pseudo-random agent.
//       const randomAgent = await pickRandomUser(
//         customer.tenantId,
//         roles.agent,
//         customer.employer.segment
//       )
//       // no agent user match filter
//       if (!randomAgent) { throw new ServerError(404, 'Error: Failed to assign agent') }

//       // agent found
//       return randomAgent
//     }

//     // pick credit user if none assigned
//     if (!value.creditUser) value.creditUser = await pickCreditUser()
//     async function pickCreditUser () {
//       // pick pseudo-random credit user.
//       const randomCreditUser = await pickRandomUser(
//         customer.tenantId,
//         roles.credit,
//         customer.employer.segment
//       )
//       // no credit user match filter
//       if (!randomCreditUser) {
//         throw new ServerError(
//           404,
//           'Error: Failed to assign credit officer'
//         )
//       }

//       return randomCreditUser
//     }

//     // setting customer parameters on loan document
//     value.customer = customer._id
//     value.params.netPay = customer.netPay
//     // value.params.age = calcAge(customer.birthDate)
//     // value.params.serviceLen = calcServiceLength(customer.employer.hireDate)

//     const newLoan = new Loan(value)

//     // run new loan document validation
//     const loanError = newLoan.validateSync()
//     if (loanError) {
//       const msg =
//                 loanError.errors[Object.keys(loanError.errors)[0]].message
//       return new ServerError(400, msg)
//     }

//     // calculate cost
//     const cost = (newLoan.amount * get('charge.rate')) / 100
//     if (foundLender.balance < cost) newLoan.isLocked = true
//     // new ServerError(402, 'Insufficient wallet balance.');
//     const newTransaction = new Transaction({
//       lender: customer.tenantId,
//       status: txnStatus.success,
//       category: 'Debit',
//       desc: 'billed for loan request',
//       channel: 'app wallet',
//       amount: cost,
//       balance: foundLender.balance - cost,
//       paidAt: new Date()
//     })

//     await customer.save({ session })
//     await newLoan.save({ session })
//     await newTransaction.save({ session })
//     await foundLender.updateOne(
//       {
//         $inc: { balance: -cost, request_count: 1, total_cost: cost },
//         lastReqDate: new Date()
//       },
//       { session }
//     )

//     await session.commitTransaction()
//     session.endSession()

//     return {
//       message: 'Loan created.',
//       data: {
//         loan: newLoan,
//         customer
//       }
//     }
//   } catch (exception) {
//     // if an error occurred abort the whole transaction
//     // and undo any changes that might have happened
//     await session.abortTransaction()
//     session.endSession()

//     logger.error({
//       method: 'create_loan',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)

//     // duplicate field error
//     if (exception.name === 'MongoServerError') {
//       let field = Object.keys(exception.keyPattern)[0].toUpperCase()
//       field = field.replace('ACCOUNTNO', 'Account Number')
//       return new ServerError(409, field + ' already in use')
//     }

//     if (exception.name === 'ValidationError') {
//       const field = Object.keys(exception.errors)[0]
//       return new ServerError(
//         400,
//         exception.errors[field].message.replace('Path', '')
//       )
//     }

//     if (exception instanceof ServerError) return exception

//     return new ServerError(500, 'Something went wrong')
//   }
// }
// export async function getAll (user, filters) {
//   try {
//     // initializing query object
//     const queryFilter = {}
//     if (user.role === roles.master) {
//       if (filters?.lender) queryFilter.lender = filters.lender
//     } else {
//       if (user.role === roles.agent) queryFilter.agent = user.id
//       else queryFilter['customer.lender'] = user.lender
//     }

//     applyFilters(filters)
//     function applyFilters (filters) {
//       if (filters?.status) {
//         const validStatus = Object.values(loanStatus)

//         // mutating array in place to change elements to lowercase
//         validStatus.forEach((element, index, array) => {
//           array.splice(index, 1, element.toLowerCase())
//         })

//         if (!validStatus.includes(filters.status.toLowerCase())) { throw new ServerError(400, 'Invalid loan status') }

//         queryFilter.status = new RegExp(filters.status, 'i')
//       }

//       // date filter - createdAt
//       if (filters?.start) {
//         const dateTime = DateTime.fromJSDate(new Date(filters.start))
//           .setZone(user.timeZone)
//           .toUTC()
//         if (!dateTime.isValid) { throw new ServerError(400, 'Invalid start date') }

//         queryFilter.createdAt = {
//           $gte: dateTime
//         }
//       }
//       if (filters?.end) {
//         const dateTime = DateTime.fromJSDate(new Date(filters.end))
//           .setZone(user.timeZone)
//           .toUTC()
//         if (!dateTime.isValid) { throw new ServerError(400, 'Invalid end date') }

//         const target = queryFilter.createdAt
//           ? queryFilter.createdAt
//           : {}
//         queryFilter.createdAt = Object.assign(target, {
//           $lte: dateTime
//         })
//       }

//       // number filter - recommended amount
//       if (filters?.minA) {
//         const minAmount = parseInt(filters.minA)
//         if (!Number.isFinite(minAmount)) { throw new ServerError(400, 'Invalid minimum loan amount') }

//         queryFilter.recommendedAmount = {
//           $gte: minAmount
//         }
//       }
//       if (filters?.maxA) {
//         const maxAmount = parseInt(filters.maxA)
//         if (!Number.isFinite(maxAmount)) { throw new ServerError(400, 'Invalid maximum loan amount') }

//         const target = queryFilter.recommendedAmount
//           ? queryFilter.recommendedAmount
//           : {}
//         queryFilter.recommendedAmount = Object.assign(target, {
//           $lte: maxAmount
//         })
//       }

//       // number filter - recommended tenor
//       if (filters?.minT) {
//         const minTenor = parseInt(filters.minT)
//         if (!Number.isFinite(minTenor)) { throw new ServerError(400, 'Invalid minimum loan tenor') }

//         queryFilter.recommendedTenor = {
//           $gte: minTenor
//         }
//       }
//       if (filters?.maxT) {
//         const maxTenor = parseInt(filters.maxA)
//         if (!Number.isFinite(maxTenor)) { throw new ServerError(400, 'Invalid maximum loan tenor') }

//         const target = queryFilter.recommendedTenor
//           ? queryFilter.recommendedTenor
//           : {}
//         queryFilter.recommendedTenor = Object.assign(target, {
//           $lte: maxTenor
//         })
//       }
//     }

//     const foundLoans = await aggregate([
//       {
//         $lookup: {
//           from: 'customers',
//           localField: 'customer',
//           foreignField: '_id',
//           as: 'customer'
//         }
//       },
//       {
//         $match: queryFilter
//       },
//       {
//         $unwind: '$customer'
//       },
//       {
//         $sort: { createdAt: -1 }
//       }
//     ])

//     if (foundLoans.length == 0) { return new ServerError(404, 'No loans found') }

//     return {
//       message: 'success',
//       data: foundLoans
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'get_all',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     if (exception?.errorCode) return exception
//     return new ServerError(500, 'Something went wrong')
//   }
// }
// export async function getOne (id) {
//   try {
//     const foundLoan = await __findById(id).populate({
//       path: 'customer',
//       model: Customer
//     })
//     if (!foundLoan) new ServerError(404, 'Loan document not found')

//     return {
//       message: 'success',
//       data: foundLoan
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'get_one',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return new ServerError(500, 'Something went wrong')
//   }
// }
// export async function update (id, user, payload) {
//   try {
//     const foundLender = await _findById(user.lender).populate({
//       path: 'segments.id',
//       model: Segment
//     })
//     if (!foundLender) return new ServerError(404, 'Tenant not found')
//     if (!foundLender.active) { return new ServerError(403, 'Tenant is yet to be activated') }

//     const foundLoan = await __findById(id).populate({
//       path: 'customer',
//       model: Customer
//     })
//     if (!foundLoan) return new ServerError(404, 'Document not found')
//     if (foundLoan.isLocked) { return new ServerError(403, 'Loan document is locked') }

//     const { liquidated, matured } = loanStatus
//     if (foundLoan.status === liquidated || foundLoan.status === matured) {
//       return new ServerError(
//         403,
//         'Cannot modify a matured or liquidated loan'
//       )
//     }

//     // get Validator
//     const { customer } = foundLoan
//     const loanValidators = await getValidator(
//       foundLender,
//       customer.employer.segment
//     )
//     if (loanValidators instanceof Error) { return new ServerError(500, 'Error fetching segment parameters.') }

//     // validating loan
//     const { error } = loanValidators.update(payload)
//     if (error) return new ServerError(400, error.details[0].message)

//     payload = flatten(payload)
//     const response = await loanManager.update(user, foundLoan, payload)

//     // alter loan parameters
//     if (payload?.params) {
//       const { master, owner } = roles
//       if (![master, owner].includes(user.role)) { return new ServerError(403, 'Cannot alter loan parameters') }

//       Object.keys(payload.params).forEach(
//         (key) => (foundLoan.params[key] = payload.params[key])
//       )
//     }

//     // reassign agent or credit user
//     if (payload?.agent || payload?.creditUser) {
//       const { admin, master, owner } = roles
//       if (![admin, master, owner].includes(user.role)) { return new ServerError(403, 'Cannot reassign personnel') }

//       if (payload.creditUser) { foundLoan.set({ creditUser: payload.creditUser }) }
//       if (payload.agent) foundLoan.set({ agent: payload.agent })
//     }

//     if (payload?.status) {
//       if (user.role !== roles.credit) { return new ServerError(403, 'Cannot modify loan status') }

//       updateStatus(foundLoan, payload)
//       function updateStatus (doc, payload) {
//         const { approved, denied, discntd, liquidated, matured } =
//                     loanStatus
//         switch (payload.status) {
//           case approved:
//             doc.set({
//               active: true,
//               approveDenyDate: new Date(),
//               maturityDate: DateTime.now()
//                 .plus({ months: payload.recommendedTenor })
//                 .toUTC()
//                 .toFormat('yyyy-MM-dd')
//             })
//             break

//           case denied:
//             doc.set({
//               active: false,
//               approveDenyDate: new Date(),
//               isBooked: false,
//               isDisbursed: false
//             })
//             break

//           case discntd:
//             doc.set({
//               active: false,
//               isBooked: false,
//               isDisbursed: false
//             })
//             break

//           case liquidated:
//             doc.set({
//               active: false,
//               dateLiquidated: new Date()
//             })
//             break

//           case matured:
//             doc.set({
//               active: false,
//               approveDenyDate:
//                                 payload.approveDenyDate || new Date(),
//               maturityDate: payload.maturityDate || new Date(),
//               isLocked: true
//             })
//             break
//         }
//       }
//     }

//     // not a credit user, create pending edit.
//     if (user.role !== roles.credit) {
//       const newPendingEdit = new PendingEdit({
//         lender: user.lender,
//         docId: foundLoan._id,
//         type: 'Loan',
//         createdBy: user.id,
//         modifiedBy: user.id,
//         alteration: payload
//       })
//       await newPendingEdit.save()

//       return {
//         message: 'Submitted. Awaiting review.',
//         body: newPendingEdit
//       }
//     }

//     foundLoan.set(payload)

//     return {
//       message: 'Loan updated',
//       data: foundLoan
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'update',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return new ServerError(500, 'Something went wrong')
//   }
// }
// export async function delete_ (id) {
//   try {
//     const foundLoan = await __findById(id)
//     if (!foundLoan) return new ServerError(404, 'Loan not found')

//     foundLoan.delete()

//     return {
//       message: 'Loan deleted'
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'delete',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return new ServerError(500, 'Something went wrong')
//   }
// }
// export async function getDisbursement (user, filters) {
//   try {
//     // TODO: handle end date on the controller function
//     const queryFilter = {
//       'customer.lender': user.lender,
//       active: true,
//       isDisbursed: false,
//       status: loanStatus.approved
//     }

//     applyFilters(filters)
//     function applyFilters (filters) {
//       if (filters?.disbursed) { queryFilter.isDisbursed = filters.disbursed === 'true' }

//       // date filter - createdAt
//       if (filters?.start) {
//         queryFilter.createdAt = {
//           $gte: DateTime.fromJSDate(new Date(filters.start))
//             .setZone(user.timeZone)
//             .toUTC()
//         }
//       }
//       if (filters?.end) {
//         const target = queryFilter.createdAt
//           ? queryFilter.createdAt
//           : {}
//         queryFilter.createdAt = Object.assign(target, {
//           $lte: DateTime.fromJSDate(new Date(filters.end))
//             .setZone(user.timeZone)
//             .toUTC()
//         })
//       }
//     }

//     const foundLoans = await aggregate([
//       {
//         $lookup: {
//           from: 'customers',
//           localField: 'customer',
//           foreignField: '_id',
//           as: 'customer'
//         }
//       },
//       {
//         $match: queryFilter
//       },
//       {
//         $unwind: '$customer'
//       },
//       {
//         $project: {
//           _id: true,
//           createdAt: true,
//           approveDenyDate: true,
//           'customer.accountName': true,
//           recommendedAmount: true,
//           netValue: true,
//           'customer.bank.name': true,
//           'customer.accountNo': true,
//           'customer.bank.code': true,
//           'customer.bvn': true,
//           'customer.ippis': true
//         }
//       },
//       {
//         $replaceRoot: {
//           newRoot: {
//             $mergeObjects: ['$$ROOT', '$customer']
//           }
//         }
//       },
//       {
//         $unset: 'customer'
//       },
//       {
//         $sort: { createdAt: -1 }
//       }
//     ])

//     if (foundLoans.length === 0) { return new ServerError(404, 'You have no pending disbursements') }

//     return {
//       message: 'success',
//       data: foundLoans
//     }
//   } catch (exception) {
//     logger.error({
//       method: 'get_disbursement',
//       message: exception.message,
//       meta: exception.stack
//     })
//     debug(exception)
//     return new ServerError(500, 'Something went wrong')
//   }
// }
// export async function getLoanBooking (request) {
//   try {
//     request.body.active = true
//     request.body.booked = false
//     request.body.status = 'Approved'
//     request.body.lenderId = request.user.lenderId
//     request.body.createdAt = { $gte: new Date(request.body.fromDate) }

//     return await loanManager.getLoanBooking(request.body)
//   } catch (exception) {
//     logger.error({ message: exception.message, meta: exception.stack })
//     debug(exception)
//     return { errorCode: 500, message: 'Something went wrong.' }
//   }
// }
