import { schedule } from 'node-cron'
import deleteApprovedPendingDocs from '../controllers/pendingEditController'

function print () {
  return console.log('job running')
}
function print2 () {
  return console.log('Boyy!!!!')
}

function jobs_ () {
  // Every sunday between 23:00 and 23:20
  // nodeCron.schedule("* 0-20 23 * * 0", deleteApprovedPendingDocs);

  // Every day between 7:00 - 7:20am 24h
  // nodeCron.schedule("* 0-20 7 * * *", closeExpiringLoans);

  const job2 = schedule('10-50 * * * * *', print2)
}

export default jobs_
