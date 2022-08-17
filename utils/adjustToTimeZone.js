const moment = require('moment-timezone');


/**
 * Adjusts timestamps to user time zone.
 * @param {String} timeZone User time zone.
 * @param {Object|Object[]} documents mongodb document or array of docs.
 * @returns {Object|Object[]}
 */
function adjustTOUserTimeZone(timeZone, documents) {
    if(Array.isArray(documents)) {
        if(typeof doc === 'object') console.log('has nested object')
        documents.forEach(doc => {
            if(typeof doc === 'object' && Object.hasOwn(doc, '_doc'))
            if(doc._doc.createdAt) doc._doc.createdAt = moment.tz(doc.createdAt, timeZone).format()
            if(doc._doc.updatedAt) doc._doc.updatedAt = moment.tz(doc.updatedAt, timeZone).format()
            if(doc._doc.lastLoginTime) doc._doc.lastLoginTime = moment.tz(doc.lastLoginTime, timeZone).format();
            if(doc._doc.dateLiquidated) doc._doc.dateLiquidated = moment.tz(doc.dateLiquidated, timeZone).format();
            if(doc._doc.dateApprovedOrDenied) doc._doc.dateApprovedOrDenied = moment.tz(doc.dateApprovedOrDenied, timeZone).format();
        })

    }else{
        for(const key in documents) {
            console.log(key)
            if(typeof documents[key] === '_doc') {
                console.log(documents._doc[key])
                adjustTOUserTimeZone(timeZone, documents._doc[key])
            }

        }

        // if(documents.customer) {
        //     // console.log(documents.customer._doc)
        //     if(documents.customer.createdAt) documents.customer.createdAt = moment.tz(documents.createdAt, timeZone).format();
        //     if(documents.customer.updatedAt) documents.customer.updatedAt = moment.tz(documents.updatedAt, timeZone).format();
        // }
        // if(documents.loan) {
        //     if(documents.loan.createdAt) documents.loan.createdAt = moment.tz(documents.createdAt, timeZone).format();
        //     if(documents.loan.updatedAt) documents.loan.updatedAt = moment.tz(documents.updatedAt, timeZone).format();
        //     if(documents.loan.dateLiquidated) documents.loan.dateLiquidated = moment.tz(documents.dateLiquidated, timeZone).format();
        //     if(documents.loan.dateApprovedOrDenied) documents.loan.dateApprovedOrDenied = moment.tz(documents.dateApprovedOrDenied, timeZone).format();
        // }else{
        //     if(documents._doc.createdAt) documents._doc.createdAt = moment.tz(documents.createdAt, timeZone).format();
        //     if(documents._doc.updatedAt) documents._doc.updatedAt = moment.tz(documents.updatedAt, timeZone).format();
        //     if(documents._doc.lastLoginTime) documents._doc.lastLoginTime = moment.tz(documents.lastLoginTime, timeZone).format();
        //     if(documents._doc.dateLiquidated) documents._doc.dateLiquidated = moment.tz(documents.dateLiquidated, timeZone).format();
        //     if(documents._doc.dateApprovedOrDenied) documents._doc.dateApprovedOrDenied = moment.tz(documents.dateApprovedOrDenied, timeZone).format();
        // };
    };
    
    return documents;
};

module.exports = adjustTOUserTimeZone;