import { Router } from 'express';
import upload from '../middleware/fileUploader.js';
import validateObjectId from '../middleware/validateObjectId.js';
import verifyJWT from '../middleware/verifyJWT.js';
import UserController from '../user/user.controller.js';
import userConfigRouter from './userConfig.routes.js';

const router = Router();

router.use('/configurations', userConfigRouter);

router.post('/', verifyJWT, UserController.createUser);

router.post('/forgot-password', UserController.forgotPassword);

router.post(
  '/uploads',
  verifyJWT,
  upload.single('avatar'),
  UserController.uploadFiles,
);

router.post('/verify-signup', UserController.verifySignup);

router.post(
  '/:userId/change-password',
  verifyJWT,
  UserController.changePassword,
);

router.post(
  '/:userId/deactivate',
  verifyJWT,
  validateObjectId,
  UserController.deactivateUser,
);

router.get('/', verifyJWT, UserController.getUsers);

router.get('/me', verifyJWT, UserController.getCurrentUser);

router.get('/:userId', verifyJWT, validateObjectId, UserController.getUser);

router.get(
  '/:userId/reactivate',
  verifyJWT,
  validateObjectId,
  UserController.reactivateUser,
);

router.get(
  '/:userId/reset-password',
  verifyJWT,
  validateObjectId,
  UserController.resetPassword,
);

router.patch(
  '/:userId',
  verifyJWT,
  validateObjectId,
  UserController.updateUser,
);

router.delete(
  '/:userId',
  verifyJWT,
  validateObjectId,
  UserController.deleteUser,
);

export default router;
