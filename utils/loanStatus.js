const { DateTime } = require('luxon');
const debug = require('debug')('app:updateLoanDoc')


async function updateStatus(alteration, loanDoc) {
    try{
        const status = alteration.status;

        switch(status) {
            case 'Approved':
                loanDoc.set(alteration)
                loanDoc.set({
                    active: true,
                    dateApprovedOrDenied: new Date(),
                    maturityDate: DateTime.now().plus({months: loanDoc.recommendedTenor}).toUTC().toFormat('yyyy-MM-dd')
                })
                
                // await loanDoc.save()
                return loanDoc;
            
            case 'Denied':
                loanDoc.set(alteration)
                loanDoc.set({
                    dateApprovedOrDenied: new Date(),
                    active: false
                })
                
                // await loanDoc.save()
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

                // await loanDoc.save()
                return loanDoc;
    
            case 'Discontinued':
                loanDoc.set(alteration)
                loan.set({
                    active: false,
                })

                // await loanDoc.save()
                return loanDoc;

            default:
                break;
        }
    }catch(exception) {
        debug(exception)
        return exception;
    };
};

module.exports = updateStatus;