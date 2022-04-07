// const express = require('express');
// const { User } = require('../db/models');
// const passport = require('passport');

// const router = express.Router();
// const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

// const eAccessLevel = {
//     NONE : 0,
//     USER : 10,
//     COUNSELOR : 20,
//     SERVICE_OPERATOR : 30,
//     SERVICE_ADMIN : 40,
//     SYSTEM_OPERATOR : 50,
//     SYSTEM_ADMIN : 60,
// }

// const eApiMessageType = {
//     NONE : 0,

//     // SERVER_TEST
//     SERVER_TEST_REQ : 10001,

//     // USER : 11
//     USER_SIGNUP_REQ : 11001,
//     USER_LOGIN_REQ : 11002,
//     USER_LOGOUT_REQ : 11003,
//     USER_CHANGE_PASSWD_REQ : 11004,
//     USER_GET_ONE_INFO_REQ : 11005,
//     USER_GET_LIST_REQ: 11006,
//     USER_UPDATE_REQ : 11007,
//     USER_UPDATE_NICKNAME_REQ : 11008,
//     USER_UPDATE_PROFILE_IMAGE_URL_REQ : 11009,

//     USER_CREATE_INQUIRY_REQ : 11010,
//     USER_UPDATE_INQUIRY_REQ : 11011,
//     USER_DELETE_INQUIRY_REQ : 11012,
//     USER_GET_ONE_INQUIRY_REQ : 11013,
//     USER_GET_LIST_INQUIRY_REQ : 11014,

//     USER_GET_ONE_NOTICE_REQ : 11015,
//     USER_GET_LIST_NOTICE_REQ : 11016,
//     USER_GET_COUNT_NOTICE_REQ : 11017,

//     USER_GET_ONE_FAQ_REQ : 11018,
//     USER_GET_LIST_FAQ_REQ : 11019,
//     USER_GET_COUNT_FAQ_REQ : 11020,
//     USER_GET_LIST_FAQ_BY_CATEGORY_REQ : 11021,

//     USER_SIGNUP_AUTHCODE_REQ : 11022,
//     USER_FIND_ACCOUNT_ID_REQ : 11023,
//     USER_FIND_PASSWD_REQ : 11024,

//     USER_GET_LIST_NOTICE_BY_SEARCHWORD_REQ : 11025,


//     // ADMIN: 12
//     ADMIN_LOGIN_REQ : 12001,
//     ADMIN_LOGOUT_REQ : 12002,
//     ADMIN_CHANGE_PASSWD_REQ : 12003,
//     ADMIN_CREATE_ADMIN_REQ : 12004,
//     ADMIN_UPDATE_ADMIN_REQ : 12005,
//     ADMIN_DELETE_ADMIN_REQ : 12006,
//     ADMIN_GET_ONE_ADMIN_REQ : 12007,
//     ADMIN_DECRYPT_SESSION_REQ : 12008,

//     ADMIN_CREATE_INQUIRY_REQ : 12009,
//     ADMIN_UPDATE_INQUIRY_REQ : 12010,
//     ADMIN_DELETE_INQUIRY_REQ : 12011,
//     ADMIN_GET_ONE_INQUIRY_REQ : 12012,
//     ADMIN_GET_LIST_INQUIRY_REQ : 12013,

//     ADMIN_CREATE_NOTICE_REQ : 12014,
//     ADMIN_UPDATE_NOTICE_REQ : 12015,
//     ADMIN_DELETE_NOTICE_REQ : 12016,
//     ADMIN_GET_ONE_NOTICE_REQ : 12017,
//     ADMIN_GET_LIST_NOTICE_REQ : 12018,

//     ADMIN_CREATE_FAQ_REQ : 12019,
//     ADMIN_UPDATE_FAQ_REQ : 12020,
//     ADMIN_DELETE_FAQ_REQ : 12021,
//     ADMIN_GET_ONE_FAQ_REQ : 12022,
//     ADMIN_GET_LIST_FAQ_REQ : 12023,

// }

// // GET /
// router.get('/', (req, res) => {
//     res.send('OK');
// });

// // 회원가입 
// // POST /signup
// router.post('/signup', isNotLoggedIn, async (req, res, next) => { // POST /signup/
//     try {
//         if (req.body.msgType === eApiMessageType.ADMIN_CREATE_ADMIN_REQ) {

//             const exEmail = await User.findOne({ // 이메일 검사
//                 where: {
//                     email: req.body.data.email,
//                 }
//             });

//             if (exEmail) {
//                 // return으로 res(응답)을 한번만 보내도록 한다. 응답 후 router 종료된다.
//                 return res.status(200).send({ status: "Internal Server Error", errCode: 500, message: "used email"});
//             }
    
//             // User 테이블에 admin 생성하기
//             await User.create({
//                 email: req.body.data.email,
//                 password: req.body.data.password,
//                 accessLevel: eAccessLevel.SERVICE_ADMIN,
//             });
            
//             res.status(201).send({ status: "OK", errCode: 200, message: "success to create admin"});
//         }
        
//     } catch(err) {
//         console.error(err);
//         next(err); // status(500) - 서버에러
//     }
// });

// // 로그인
// // 미들웨어 확장법 (req, res, next를 사용하기 위해서)
// // passport index.js에서 전달되는 done의 세가지 인자를 받는다.
// router.post('/login', isNotLoggedIn, (req, res, next) => {
//     passport.authenticate('local', (err, user, info) => {
//         if (err) { // 서버 에러
//             console.error(err);
//             return next(err);
//         }
//         if (info) { // 클라이언트 에러 (비밀번호가 틀렸거나, 계정이 없거나), info.message에 에러 내용이 있음.
            
//             res.status(200).send({ status: "Internal Server Error", errCode: 500, message: info.toString()});
//         }
//         // req.login하면 serializeUser 실행
//         // 아래는 passport에서 serializeUser 통과 후  if문부터 실행
//         return req.logIn(user, async (loginErr) => {
//             if (loginErr) {
//                 console.error(loginErr);
//                 return next(loginErr);
//             }
//             // 비밀번호를 제외한 모든 정보 가져오기
//             const fullAdminWithoutPassword = await User.findOne({
//                 where: { email: user.email },
//                 attributes: {
//                     exclude: ['password'], // exclude: 제외한 나머지 정보 가져오기
//                 }
//             });
//             req.session.save((err) => {
//                 if (err) {
//                   console.error(err)
//                   next(err)
//                 } else {
//                   res.redirect(`/`)
//                 }
//               })
//             // 세션쿠키와 json 데이터를 브라우저로 보내준다.
//             return res.status(200).send(fullAdminWithoutPassword);
//         });
//     })(req, res, next);
// });

// // 로그아웃
// // POST /admin/logout/
// router.post('/logout', isLoggedIn, (req, res) => {
//     req.logOut();
//     req.session.destroy();
//     res.send('로그아웃');
// });

// module.exports = router;