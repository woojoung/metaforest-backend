const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../db/models');

module.exports = () => {
    passport.use('local', new LocalStrategy({
        usernameField: 'accountId',
        passwordField: 'password',
    }, async (accountId, password, done) => { 
        try {
            const user = await User.findOne({
                where: { accountId: accountId },
                plain: true
            });
            if (!user) {
                return done(null, false, { message: 'Incorrect accountId'});
            }

            if (password === user.password) { 
                return done(null, user);
            }
            
            return done(null, false, { message: 'Incorrect password' });
        } catch (err) {
            console.error(err);
            return done(err);
        }
    }));

};