import ReviewDAO from '../daos/review.dao.js'

class ReviewService {
  static async createReview(dto) {
    const newReview = await ReviewDAO.insert(dto)

    return newReview
  }

  static async getReviews(currentUser) {
    const filter = { tenantId: currentUser.tenantId }

    const foundReviews = await ReviewDAO.findAll(filter)
    const count = Intl.NumberFormat('en-US').format(foundReviews.length)

    return [count, foundReviews]
  }

  static async getReviewById(reviewId) {
    const foundReview = await ReviewDAO.findById(reviewId)
    return foundReview
  }

  static async getReviewByField(filter) {
    const foundReview = await ReviewDAO.findOne(filter)
    return foundReview
  }

  static async updateReview(reviewId, dto) {
    const updatedReview = await ReviewDAO.update(reviewId, dto)

    return updatedReview
  }

  static async deleteReview(reviewId) {
    const deletedReview = await ReviewDAO.remove(reviewId)
    return deletedReview
  }
}

export default ReviewService
