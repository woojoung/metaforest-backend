const passport = require('passport');
const local = require('./localStrategy');
// const kakao = require('./kakaoStrategy');
// const google = require('./googleStrategy');
const { User, Admin } = require('../db/models');

module.exports = () => {
    passport.serializeUser((user, done) => {
        console.log('wooree serializeUser: ', user.dataValues)
        done(null, user.userId)
    });

    passport.deserializeUser( async (userId, done) => {
        console.log('userId: ',userId)
        try {
            const user = await User.findOne({ where: { userId: userId }});
            done(null, user);
        } catch(error) {
            console.error(error);
            done(error);
        }
    });

    local();
    // kakao();
    // google();
};