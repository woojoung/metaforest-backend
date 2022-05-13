const passport = require('passport');
const local = require('./localStrategy');
// const kakao = require('./kakaoStrategy');
// const google = require('./googleStrategy');
const { User } = require('../db/models');

module.exports = () => {
    passport.serializeUser((user, done) => {
        console.log('serializeUseruser user.userId: ', user.userId);
        console.log('serializeUser user.dataValues : ', user.dataValues);
        done(null, user.userId)
    });

    passport.deserializeUser( async (userId, done) => {
        console.log('deserializeUser userId: ',userId)
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