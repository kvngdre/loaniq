import { dbSetup } from '../config'
import logger from '../utils/logger'
import mongoose from 'mongoose'

export default async () => {
  mongoose.set('strictQuery', true)

  await mongoose
    .connect(dbSetup.uri, dbSetup.options)
    .then(() => logger.info(`Connected to ${dbSetup.env} DB.`))
    .catch((error) => {
      logger.fatal('⚠ Failed to connect to DB ⚠', error.stack)
      process.exit(1)
    })
}
