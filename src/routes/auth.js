const express = require('express');
const { User } = require('../db/models');
const passport = require('passport');

const router = express.Router();
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const { smtpTransport } = require('../config/email');

const crypto = require('crypto');
const axios = require('axios');


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
    USER_SIGNUP_AUTHCODE_REQ : 11010,
    USER_FIND_ACCOUNT_ID_REQ : 11011,
    USER_FIND_PASSWD_REQ : 11012,
    USER_SIGNUP_AUTH_MOBILE_REQ : 11013,


    // NOTICE : 12
    USER_CREATE_NOTICE_REQ : 12001,
    USER_UPDATE_NOTICE_REQ : 12002,
    USER_DELETE_NOTICE_REQ : 12003,
    USER_GET_ONE_NOTICE_REQ : 12004,
    USER_GET_LIST_NOTICE_REQ : 12005,
    USER_GET_COUNT_NOTICE_REQ : 12006,
    USER_GET_LIST_NOTICE_BY_SEARCHWORD_REQ : 12007,


    // INQUIRY : 13
    USER_CREATE_INQUIRY_REQ : 13001,
    USER_UPDATE_INQUIRY_REQ : 13002,
    USER_DELETE_INQUIRY_REQ : 13003,
    USER_GET_ONE_INQUIRY_REQ : 13004,
    USER_GET_LIST_INQUIRY_REQ : 13005,


    // FAQ : 14
    USER_CREATE_FAQ_REQ : 14001,
    USER_UPDATE_FAQ_REQ : 14002,
    USER_DELETE_FAQ_REQ : 14003,
    USER_GET_ONE_FAQ_REQ : 14004,
    USER_GET_LIST_FAQ_REQ : 14005,
    USER_GET_COUNT_FAQ_REQ : 14006,
    USER_GET_LIST_FAQ_BY_CATEGORY_REQ : 14007,

    // PARTNER : 15
    USER_CREATE_PARTNER_REQ : 15001,
    USER_UPDATE_PARTNER_REQ : 15002,
    USER_DELETE_PARTNER_REQ : 15003,
    USER_GET_ONE_PARTNER_REQ : 15004,
    USER_GET_LIST_PARTNER_REQ : 15005,
    USER_GET_COUNT_PARTNER_REQ : 15006,
    USER_VERIFY_PARTNER_CODE_REQ : 15007,
    
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
router.post('/signup', isNotLoggedIn, async (req, res, next) => {
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
                    return res.status(200).send({ status: 500, errCode: 500, message: "failed to send email" });
                } else {
                    // console.log(info.response);
                    return res.status(200).send({ status: 200, errCode: 200, message: "success to send email", authCode: authCode });
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
                // return 후 router 종료
                return res.status(200).send({ status: 500, errCode: 500, message: "used email"});
            }
            if (exNickname) {
                return res.status(200).send({ status: 500, errCode: 500, message: "used nickname"});
            }
    
            await User.create({
                userNickname: req.body.data.userNickname,
                profileImageUrl: req.body.data.profileImageUrl,
                accountId: req.body.data.accountId,
                password: req.body.data.password,
                email: req.body.data.email,
                gender: req.body.data.gender,
                birth: req.body.data.birth,
                md5Mobile: req.body.data.md5Mobile,
                marketingAgreeTime: req.body.data.marketingAgreeTime,
                accessLevel: req.body.data.accessLevel,
            });

            res.status(201).send({ status: 200, errCode: 200, message: "success to create user"});
        } else if (req.body.msgType === eApiMessageType.USER_SIGNUP_AUTH_MOBILE_REQ) {
            const phone = req.body.data.phone ?? '';

            if (phone === '') {
                return res.status(200).send({ status: 500, errCode: 500, message: "phone === ''"});
            }
            const scretKey = process.env.SECRET_KEY;
            const accessKeyId = process.env.ACCESS_KEY_ID;
            const uri = process.env.SERVICE_ID; 

            const user_phone_number = phone;
            const date = Date.now().toString();

            const method = "POST";
            const space = " ";
            const newLine = "\n";
            const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
            const url2 = `/sms/v2/services/${uri}/messages`;

            const hmac = crypto.createHmac('sha256', scretKey);
            hmac.update(method);
            hmac.update(space);
            hmac.update(url2);
            hmac.update(newLine);
            hmac.update(date);
            hmac.update(newLine);
            hmac.update(accessKeyId);
            const signature = hmac.digest('base64');

            const body = {
                type: "SMS",
                countryCode: "82",
                from: "01012341234",//"발신번호기입",
                content: "naver_sms_test", // 인증번호
                messages: [
                  { to: `${user_phone_number}`, }],
            };
            
            const options = {
                headers: {
                  "Contenc-type": "application/json; charset=utf-8",
                  "x-ncp-iam-access-key": accessKeyId, // accessKey 
                  "x-ncp-apigw-timestamp": date,
                  "x-ncp-apigw-signature-v2": signature, 
                },
            };
            
            const axios_response = await axios.post(url,body,options)
            return axios_response;


        } else {
            res.status(200).send(null);
        }
        
    } catch(err) {
        console.error(err);
        next(err); // status(500) - 서버에러
    }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            console.error(err);
            return next(err);
        }
        if (info) {
            
            return res.status(200).send({ status: 500, errCode: 500, message: info.toString()});
        }
        // req.login 후 serializeUser 실행
        // passport에서 serializeUser 후  if문 실행
        return req.login(user, async (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }

            const fullUserWithoutPassword = await User.findOne({
                where: { email: user.email },
                attributes: {
                    exclude: ['password'],
                }
            });

            return res.status(200).send({ status: 200, errCode: 200, message: "OK", data: fullUserWithoutPassword});
        });
    })(req, res, next);
});

// 로그아웃
// POST /logout/
router.post('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    req.session.destroy();
    return res.status(200).send({ status: 200, errCode: 200, message: "Logout"});
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