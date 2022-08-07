const moment = require('moment')
const debug = require('debug')('app:updateLoanDoc')

async function status(status, alteration, loanDoc) {
    try{
        switch(status) {
            case 'Approved':
                loanDoc.set(alteration)
                loanDoc.set({
                    active: true,
                    dateApprovedOrDenied: new Date(),
                    expectedEndDate: moment(new Date().toISOString()).add(loanDoc.recommendedTenor, 'months').format('YYYY-MM-DD')
                })
                
                await loanDoc.save()
                return loanDoc;
            
            case 'Denied':
                loanDoc.set(alteration)
                loanDoc.set({
                    dateApprovedOrDenied: new Date(),
                    active: false
                })
                
                await loanDoc.save()
                return loanDoc;
    
            case 'On Hold':
                await loanDoc.set(alteration)

                await loanDoc.save()
                return loanDoc;
    
            case 'Liquidated':
                loanDoc.set(alteration)
                loanDoc.set({
                    dateLiquidated: new Date(),
                    active: false
                })

                await loanDoc.save()
                return loanDoc;
    
            case 'Discontinued':
                loanDoc.set(alteration)
                loan.set({
                    active: false,
                })

                await loanDoc.save()
                return loanDoc;
    
            default:
                break;
        }
    }catch(exception) {
        debug(exception)
        return exception;
    };
};

module.exports = status;