/**
 * Grants or denies user access to resource
 * @param {string} roles The role or array of roles permitted.
 * @returns
 */
function verifyRole(...roles) {
    return (req, res, next) => {
        if (!roles.includes(req.user.role))
            return res.status(403).send('Access Denied.');

        next();
    };
}

module.exports = verifyRole;
