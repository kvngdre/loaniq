import ReviewService from "../services/review.service.js";
import { HttpCode } from "../utils/common.js";
import ValidationError from "../utils/errors/ValidationError.js";
import reviewValidator from "../validators/review.validator.js";
import BaseController from "./base.controller.js";

class ReviewController extends BaseController {
  static createReview = async (req, res) => {
    const { value, error } = reviewValidator.validateCreate(
      req.currentUser._id,
      req.currentUser.tenantId,
      req.body,
    );
    if (error) throw new ValidationError(null, error);

    const newReview = await ReviewService.createReview(value);
    const response = this.apiResponse("Review created & Submitted.", newReview);

    res.status(HttpCode.CREATED).json(response);
  };

  static getReviews = async (req, res) => {
    const [count, reviews] = await ReviewService.getReviews(req.currentUser);

    const message = this.getMsgFromCount(count);
    const response = this.apiResponse(message, reviews);

    res.status(HttpCode.OK).json(response);
  };

  static getReview = async (req, res) => {
    const review = await ReviewService.getReviewById(req.params.reviewId);
    const response = this.apiResponse("Fetched review.", review);

    res.status(HttpCode.OK).json(response);
  };

  static updateReview = async (req, res) => {
    const { value, error } = reviewValidator.validateUpdate(req.body);
    if (error) throw new ValidationError(null, error);

    const review = await ReviewService.updateReview(req.params.reviewId, value);
    const response = this.apiResponse("Review updated.", review);

    res.status(HttpCode.OK).json(response);
  };

  static deleteReview = async (req, res) => {
    await ReviewService.deleteReview(req.params.reviewId);
    const response = this.apiResponse("Review deleted.");

    res.status(HttpCode.OK).json(response);
  };
}

export default ReviewController;
