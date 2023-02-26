import { dbSetup } from '../config'
import logger from '../utils/logger'
import mongoose from 'mongoose'

export default async () => {
  mongoose.set('strictQuery', true)

  await mongoose
    .connect(dbSetup.uri, dbSetup.options)
    .catch((error) => console.error('Failed to connect to DB.', error))

  logger.info(`Connected to ${dbSetup.env} DB`)
}
