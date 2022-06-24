const express = require('express');
const { User, Partner } = require('../db/models');
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
    USER_SIGNUP_VERIFY_ACCOUNT_ID_REQ : 11014,
    
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
            const smsFromNumber = process.env.SMS_FROM_MOBILE;

            const userPhoneNumber = phone;
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

            const authCode = generateRandom(11111, 99999);

            const body = {
                type: "SMS",
                countryCode: "82",
                from: smsFromNumber,//"발신번호기입",
                content: `MetaForest 인증번호 ${authCode} 입니다.`,
                messages: [
                  { to: `${userPhoneNumber}`, }],
            };
            
            const options = {
                headers: {
                  "Contenc-type": "application/json; charset=utf-8",
                  "x-ncp-iam-access-key": accessKeyId,
                  "x-ncp-apigw-timestamp": date,
                  "x-ncp-apigw-signature-v2": signature, 
                },
            };
            
            const axiosResponse = await axios.post(url,body,options)
            return res.status(200).send({ status: 200, errCode: 200, message: "success to send email", data: {axiosResponse: axiosResponse, authCode: authCode} });


        } else if (req.body.msgType === eApiMessageType.USER_SIGNUP_VERIFY_ACCOUNT_ID_REQ) {
            // deletedAt null 인 경우 추가.
            const exAccountId = await User.findOne({
                where: {
                    accountId: req.body.data.accountId,
                }
            });
            if (exAccountId) {
                return res.status(200).send({ status: 302, errCode: 302, message: "used accountId"});
            }

            res.status(200).send({ status: 200, errCode: 200, message: "success to create user"});
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

            const getOnePartner = await Partner.findOne({
                where: { partnerId: fullUserWithoutPassword.dataValues.partnerId },
                order: [['partnerId', 'DESC']]
            });
           
            fullUserWithoutPassword.dataValues.plan = getOnePartner?.plan ?? 0;
            fullUserWithoutPassword.dataValues.partnerNickname = getOnePartner?.partnerNickname ?? '';

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