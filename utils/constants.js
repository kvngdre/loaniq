module.exports = {
    maritalStatus: [
        'Single',
        'Married',
        'Divorced',
        'Separated',
        'Widow',
        'Widower',
    ],
    roles: {
        admin: 'Admin',
        agent: 'Agent',
        credit: 'Credit',
        master: 'Master',
        operations: 'Operations',
        owner: 'Owner',
        // support: 'Support',
    },
    relationships: [
        'Daughter',
        'Brother',
        'Cousin',
        'Father',
        'Mother',
        'Nephew',
        'Sister',
        'Spouse',
        'Niece',
        'Son',
    ],
    sort_fields: {
        'asc': 'createdAt',
        'desc': '-createdAt',
        'first': 'name.first',
        'last': 'name.last'
    },
    validIds: [
        'Voters card',
        'International passport',
        'Staff ID card',
        'National ID card',
        "Driver's license",
    ],
    
};
