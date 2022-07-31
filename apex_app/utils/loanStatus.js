const moment = require('moment')
const debug = require('debug')('app:updateLoanDoc')

async function status(status, alteration, loanDoc) {
    try{
        switch(status) {
            case 'Approved':
                await loanDoc.set('dateAppOrDec', new Date());
                await loanDoc.set(alteration)
                loanDoc.active = true
                loanDoc.expectedEndDate = moment(new Date().toISOString()).add(loanDoc.recommendedTenor, 'months').format('YYYY-MM-DD')
                
                await loanDoc.save()
                return loanDoc;
            
            case 'Denied':
                await loanDoc.set('dateAppOrDec', new Date());
                await loanDoc.set(alteration)
                await loanDoc.save()
                
                return loanDoc;
    
            case 'On Hold':
                await loanDoc.set(alteration)
                await loanDoc.save()
                
                return loanDoc;
    
            case 'Liquidated':
                await loanDoc.set(alteration)
                await loanDoc.save()
                
                return loanDoc;
    
            case 'Discontinued':
                await loanDoc.set(alteration)
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