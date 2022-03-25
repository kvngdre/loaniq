function canViewCustomer(user, customer) {
    return user.role === 'admin' || user.role === 'credit'
}

function scopedCustomers(user, customers) {
    customers.filters(customer => customer.loanAgent.includes(user._id));
}