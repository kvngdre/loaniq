import { constants } from '../config'
import { connect } from 'mongoose'

export default () => {
  const databaseUri = constants.db.uri.dev_atlas
  connect(databaseUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('Connected to DB.'))
    .catch((error) => console.error('Failed to connect to DB.', error))
}
