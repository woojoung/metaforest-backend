const express = require('express');
const { User, Admin } = require('../db/models');
// const { eAccessLevel } = require('../enums/accessLevel')

const passport = require('passport');

const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { smtpTransport } = require('../config/email');

const eAccessLevel = {
    NONE : 0,
    USER : 10,
    COUNSELOR : 20,
    SERVICE_OPERATOR : 30,
    SERVICE_ADMIN : 40,
    SYSTEM_OPERATOR : 50,
    SYSTEM_ADMIN : 60,
}

const eApiMessageType = {
    NONE : 0,

    // SERVER_TEST
    SERVER_TEST_REQ : 10001,

    // USER : 11
    USER_SIGNUP_REQ : 11001,
    USER_LOGIN_REQ : 11002,
    USER_LOGOUT_REQ : 11003,
    USER_CHANGE_PASSWD_REQ : 11004,
    USER_GET_ONE_INFO_REQ : 11005,
    USER_GET_LIST_REQ: 11006,
    USER_UPDATE_REQ : 11007,
    USER_UPDATE_NICKNAME_REQ : 11008,
    USER_UPDATE_PROFILE_IMAGE_URL_REQ : 11009,

    USER_CREATE_INQUIRY_REQ : 11010,
    USER_UPDATE_INQUIRY_REQ : 11011,
    USER_DELETE_INQUIRY_REQ : 11012,
    USER_GET_ONE_INQUIRY_REQ : 11013,
    USER_GET_LIST_INQUIRY_REQ : 11014,

    USER_GET_ONE_NOTICE_REQ : 11015,
    USER_GET_LIST_NOTICE_REQ : 11016,
    USER_GET_COUNT_NOTICE_REQ : 11017,

    USER_GET_ONE_FAQ_REQ : 11018,
    USER_GET_LIST_FAQ_REQ : 11019,
    USER_GET_COUNT_FAQ_REQ : 11020,
    USER_GET_LIST_FAQ_BY_CATEGORY_REQ : 11021,

    USER_SIGNUP_AUTHCODE_REQ : 11022,
    USER_FIND_ACCOUNT_ID_REQ : 11023,
    USER_FIND_PASSWD_REQ : 11024,

    USER_GET_LIST_NOTICE_BY_SEARCHWORD_REQ : 11025,


    // ADMIN: 12
    ADMIN_LOGIN_REQ : 12001,
    ADMIN_LOGOUT_REQ : 12002,
    ADMIN_CHANGE_PASSWD_REQ : 12003,
    ADMIN_CREATE_ADMIN_REQ : 12004,
    ADMIN_UPDATE_ADMIN_REQ : 12005,
    ADMIN_DELETE_ADMIN_REQ : 12006,
    ADMIN_GET_ONE_ADMIN_REQ : 12007,
    ADMIN_DECRYPT_SESSION_REQ : 12008,

    ADMIN_CREATE_INQUIRY_REQ : 12009,
    ADMIN_UPDATE_INQUIRY_REQ : 12010,
    ADMIN_DELETE_INQUIRY_REQ : 12011,
    ADMIN_GET_ONE_INQUIRY_REQ : 12012,
    ADMIN_GET_LIST_INQUIRY_REQ : 12013,

    ADMIN_CREATE_NOTICE_REQ : 12014,
    ADMIN_UPDATE_NOTICE_REQ : 12015,
    ADMIN_DELETE_NOTICE_REQ : 12016,
    ADMIN_GET_ONE_NOTICE_REQ : 12017,
    ADMIN_GET_LIST_NOTICE_REQ : 12018,

    ADMIN_CREATE_FAQ_REQ : 12019,
    ADMIN_UPDATE_FAQ_REQ : 12020,
    ADMIN_DELETE_FAQ_REQ : 12021,
    ADMIN_GET_ONE_FAQ_REQ : 12022,
    ADMIN_GET_LIST_FAQ_REQ : 12023,

}

const generateRandom = function(min, max) {
    let randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNum.toString()
}

// GET /
router.get('/', (req, res) => {
    res.send('OK');
});

// 회원가입 
// POST /signup
router.post('/signup', isNotLoggedIn, async (req, res, next) => { // POST /signup/
    try {
        if (req.body.msgType === eApiMessageType.USER_SIGNUP_AUTHCODE_REQ) {
            const sendEmail = req.body.data.email
            const authCode = generateRandom(11111, 99999);

            const mailOptions = {
                from: `metaforest <${process.env.USER_EMAIL}>`,
                to: sendEmail,
                subject: "authCode",
                text: "authCode : " + authCode
            }

            smtpTransport.sendMail(mailOptions, (error, info) => {
                if (error) {
                    // console.log(error);
                    return res.status(200).send({ status: "Internal Server Error", errCode: 500, message: "failed to send email" });
                } else {
                    // console.log(info.response);
                    return res.status(200).send({ status: "OK", errCode: 200, message: "success to send email", authCode: authCode });
                }

            });
            
        } else if (req.body.msgType === eApiMessageType.USER_SIGNUP_REQ) {
            const exEmail = await User.findOne({ // 이메일 검사
                where: {
                    email: req.body.data.email,
                }
            });
            const exNickname = await User.findOne({ // 이름 검사
                where: {
                    userNickname: req.body.data.userNickname,
                }
            });
            if (exEmail) {
                // return으로 res(응답)을 한번만 보내도록 한다. 응답 후 router 종료된다.
                return res.status(200).send({ status: "Internal Server Error", errCode: 500, message: "used email"});
            }
            if (exNickname) {
                return res.status(200).send({ status: "Internal Server Error", errCode: 500, message: "used nickname"});
            }
    
            // User 테이블에 생성하기
            await User.create({
                userNickname: req.body.data.userNickname,
                profileImageUrl: req.body.data.profileImageUrl,
                accountId: req.body.data.accountId,
                password: req.body.data.password,
                email: req.body.data.email,
                gender: req.body.data.gender,
                birth: req.body.data.birth,
                md5Mobile: req.body.data.md5Mobile,
                accessLevel: eAccessLevel.USER,
            });
            // 요청에 대한 성공으로 status(201) : 생성이 됐다는 의미 (기재하는게 좋다.)
            res.status(201).send({ status: "OK", errCode: 200, message: "success to create user"});
        }
        
    } catch(err) {
        console.error(err);
        next(err); // status(500) - 서버에러
    }
});

// 로그인
// 미들웨어 확장법 (req, res, next를 사용하기 위해서)
// passport index.js에서 전달되는 done의 세가지 인자를 받는다.
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { // 서버 에러
            console.error(err);
            return next(err);
        }
        if (info) { // 클라이언트 에러 (비밀번호가 틀렸거나, 계정이 없거나), info.message에 에러 내용이 있음.
            
            res.status(403).send(info);
        }
        // req.login하면 serializeUser 실행
        // 아래는 passport에서 serializeUser 통과 후  if문부터 실행
        return req.login(user, async (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }
            // 비밀번호를 제외한 모든 정보 가져오기
            const fullUserWithoutPassword = await User.findOne({
                where: { email: user.email },
                attributes: {
                    exclude: ['password'], // exclude: 제외한 나머지 정보 가져오기
                }
            });
            // req.session.save((err) => {
            //     if (err) {
            //       console.error(err)
            //       next(err)
            //     } else {
            //       res.redirect(`/user`)
            //     }
            //   })
            // 세션쿠키와 json 데이터를 브라우저로 보내준다.
            return res.status(200).send(fullUserWithoutPassword);
        });
    })(req, res, next);
});

// 로그아웃
// POST /logout/
router.post('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    req.session.destroy();
    res.send('로그아웃');
});

// 카카오 개발 앱 설정 중 Redirect URI에 적는 주소
// GET /ouath
// 카카오 로그인 페이지에서 로그인 후 아래에서 카카오 Strategy가 실행되며, kakao.js 모듈 실행
// router.get('/ouath', passport.authenticate('kakao', {
//     failureRedirect: '/',
// }), (req, res) => {
//     res.redirect('http://localhost:3000');
// });

module.exports = router;