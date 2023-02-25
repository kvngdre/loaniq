import { constants } from '.'
import { env } from './constant.config'

const databaseConnectionSetup = {
  env,
  uri: constants.db.uri[env],
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
}
export default databaseConnectionSetup
