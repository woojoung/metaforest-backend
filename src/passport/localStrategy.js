const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const { User } = require('../db/models');

module.exports = () => {
    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        // session: true, // 세션에 저장 여부
    }, async (email, password, done) => { 
        try {
            const user = await User.findOne({
                where: { email: email },
                plain: true
            });
            if (!user) {
                // passport에서는 res로 응답이 아닌, 우선 done으로 처리.
                return done(null, false, { message: 'Incorrect email'});
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