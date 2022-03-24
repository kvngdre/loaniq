function verifyRole(role) {
    return (req, res, next) => {
        if(req.user.role !== role) {
            return res.status(401).send('Access Denied. Admin users only.');
        }

        next();
    }
}

module.exports = verifyRole;
