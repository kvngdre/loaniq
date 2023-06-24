import { Router } from 'express';
import { handleRefreshToken } from '../controllers/refreshToken.controller';

const router = Router();

router.get('/', async (req, res) => {
  const response = await handleRefreshToken(req.cookies, res);
  return res.status(response.code).json(response.payload);
});

export default router;
