import { AccessControl } from 'accesscontrol'
import { userRoles } from '../utils/constants'

const ac = new AccessControl()

const roles = () => {
  ac.grant(userRoles.AGENT).createAny('loan_request')

  ac.grant(userRoles.OPERATIONS)

  ac.grant(userRoles.CREDIT)

  ac.grant(userRoles.MANAGER)

  ac.grant(userRoles.ADMIN)

  ac.grant(userRoles.OWNER)

  ac.grant(userRoles.MASTER)
}

export default roles
