import SettingsController from '../controllers/settingsController'
import Router from 'express'

const router = Router()

router.post('/', SettingsController.createSettings)

export default router
