const _ = require('lodash');
const config = require('config');
const debug = require('debug')('app:authCtrl');
const logger = require('../utils/logger')('authCtrl.js');
const ServerResponse = require('../utils/ServerResponse');

const User = require('../models/userModel');

class AuthController {
    async login(email, password, cookies, res) {
        try {
            const foundUser = await User.findOne({ email }, { queryName: 0 });
            if (!foundUser)
                return new ServerResponse(401, 'Invalid credentials');

            const isMatch = await foundUser.comparePasswords(password);
            if (!isMatch) return new ServerResponse(401, 'Invalid credentials');

            // New user or password reset trigger.
            /* 
               Condition is satisfied if:
               1. user is inactive AND
               2. reset password field is true OR
               3. last login time field is null OR
               4. email verified field is false
            */
            const passwordResetTrigged = ((user) => {
                const { active, emailVerified, lastLoginTime, resetPwd } = user;
                return (
                    !active && (resetPwd || !lastLoginTime || !emailVerified)
                );
            })(foundUser);
            if (passwordResetTrigged) {
                const {
                    active,
                    email,
                    emailVerified,
                    lastLoginTime,
                    lender,
                    name,
                    role,
                } = foundUser;
                return new ServerResponse(200, 'Password reset triggered.', {
                    name,
                    active,
                    email,
                    emailVerified,
                    role,
                    lender,
                    lastLoginTime,
                });
            }

            // user is not active
            const inactiveUser = foundUser.emailVerified && !foundUser.active;
            if (inactiveUser)
                return new ServerResponse(
                    401,
                    'Account inactive. Contact your tech support.'
                );

            const accessToken = foundUser.generateAccessToken();
            const newRefreshToken = foundUser.generateRefreshToken();

            await handleCookies(cookies);
            async function handleCookies(cookies) {
                if (cookies?.jwt) {
                    // Delete expired tokens or existing refresh token from user.
                    foundUser.refreshTokens = foundUser.refreshTokens.filter(
                        (rt) => rt.token !== cookies.jwt && Date.now() < rt.exp
                    );

                    // Check if the refresh token is being reused.
                    const foundToken = await User.findOne(
                        {
                            refreshTokens: {
                                $elemMatch: { token: cookies.jwt },
                            },
                        },
                        { password: 0 }
                    );
                    /*
                       No user found with that refresh token. Token reuse has been detected.
                       Delete all refresh tokens from user. 
                    */
                    if (!foundToken) {
                        console.log('clearing tokens');
                        foundUser.refreshTokens = [];
                        await foundUser.save();
                    }

                    // Clear all jwt cookies.
                    res.clearCookie('jwt', {
                        httpOnly: true,
                        sameSite: 'None',
                        secure: config.get('secure_cookie'),
                    });
                }

                res.cookie('jwt', newRefreshToken.token, {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: config.get('secure_cookie'),
                    maxAge: newRefreshToken.exp,
                });
            }

            foundUser.refreshTokens.push(newRefreshToken);
            foundUser.set({
                lastLoginTime: new Date(),
            });
            await foundUser.save();

            const payload = {
                active: foundUser.active,
                email: foundUser.email,
                role: foundUser.role,
                lastLoginTime: foundUser.lastLoginTime,
                lender: foundUser.lender,
                accessToken,
            };
            return new ServerResponse(200, 'Login success.', payload);
        } catch (exception) {
            logger.error({
                method: 'login',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerResponse(500, 'Something went wrong');
        }
    }

    async logout(cookies, res) {
        try {
            if (!cookies?.jwt) return new ServerResponse(204);
            const refreshToken = cookies.jwt;

            const foundUser = await User.findOne(
                { refreshTokens: { $elemMatch: { token: refreshToken } } },
                { password: 0, otp: 0 }
            );
            if (!foundUser) {
                // cookie found but does not match any user
                res.clearCookie('jwt', {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: config.get('secure_cookie'),
                });

                debug('no user found to logout');
                return new ServerResponse(204);
            }

            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                secure: config.get('secure_cookie'),
            });

            // Delete expired tokens or existing refresh token from user.
            foundUser.refreshTokens = foundUser.refreshTokens.filter(
                (rt) => rt.token !== refreshToken && Date.now() < rt.exp
            );
            await foundUser.save();

            debug('logged out');
            return new ServerResponse(200, 'Logged out');
        } catch (exception) {
            logger.error({
                method: 'logout',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerResponse(500, 'Something went wrong');
        }
    }

    async signOutAllDevices(id, cookies, res) {
        try {
            if (!cookies?.jwt) return new ServerResponse(204);
            const refreshToken = cookies.jwt;

            const foundUser = await User.findOne(
                { refreshTokens: { $elemMatch: { token: refreshToken } } },
                { password: 0, otp: 0 }
            );
            if (!foundUser) {
                // TODO: uncomment secure
                res.clearCookie('jwt', {
                    httpOnly: true,
                    sameSite: 'None',
                    secure: config.get('secure_cookie'),
                });

                debug('no user found to logout');
                return new ServerResponse(204);
            }

            res.clearCookie('jwt', {
                httpOnly: true,
                sameSite: 'None',
                secure: config.get('secure_cookie'),
            });

            // deleting refresh token from user refresh tokens on db
            foundUser.refreshTokens = foundUser.refreshTokens.filter(
                (rt) => rt.token !== refreshToken && Date.now() < rt.exp
            );
            await foundUser.save();

            debug('logged out');
            return new ServerResponse(200, 'Logged out');
        } catch (exception) {
            logger.error({
                method: 'sign_out_all_devices',
                message: exception.message,
                meta: exception.stack,
            });
            debug(exception);
            return new ServerResponse(500, 'Something went wrong');
        }
    }
}

module.exports = new AuthController();
