import WalletController from '../controllers/wallet.controller'
import { Router } from 'express'

const router = Router()

router.post('/', WalletController.createWallet)

export default router
