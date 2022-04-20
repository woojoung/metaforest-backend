const express = require('express');
const router = express.Router();
const { User } = require('../db/models');
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
    USER_SIGNUP_AUTHCODE_REQ : 11010,
    USER_FIND_ACCOUNT_ID_REQ : 11011,
    USER_FIND_PASSWD_REQ : 11012,
    USER_CREATE_REQ : 11013,


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

}

// GET /
router.get('', (req, res) => {
    res.send('OK');
});

// 로그인 사용자 정보 가져오기 (계속 로그인 상태를 만들기 위한)
// GET /user
router.get('/', isLoggedIn, async (req, res, next) => {
    try {
        if (req.user) { // req.user에는 로그인한 user 정보가 있다.
            const user = await User.findOne({
                where: { userId: req.user.userId } 
            });
            // 비밀번호를 제외한 모든 정보 가져오기
            const fullUserWithoutPassword = await User.findOne({
                where: { userId: user.userId },
                attributes: {
                    exclude: ['password'], // exclude: 제외한 나머지 정보 가져오기
                },
            });
            // res.status(200).json(fullUserWithoutPassword);
            res.status(200).send({status: 200, errCode: 200, message: "OK", data: fullUserWithoutPassword});
            
        } else {
            res.status(200).json(null);
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});

// POST /user
router.post('/', isLoggedIn, async (req, res, next) => {
    try {
        console.log(req.body.msgType)
        if (req.body.msgType === eApiMessageType.USER_GET_LIST_REQ) {
            // const getRowsUser = await User.findAll({
            //     where: { [Op.or]: {[Op.like]: req.body.data.conditions } },
            //     order: [['userId', 'DESC']],
            //     offset: req.body.data.offset,
            //     limit: req.body.data.limit
            // });

            const getRowsUser = await User.findAll({
                order: [['userId', 'DESC']]
            });

            res.status(200).send({ status: 200, message: "success to get list user", data: {rows: getRowsUser}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_ONE_INFO_REQ) {
            const getRowUser = await User.findOne({
                where: { userId: req.body.data.userId } 
            });
            console.log(getRowUser)
            res.status(200).send({ status: 200, message: "success to get user info", data: {rows: getRowUser}});
        } else if (req.body.msgType === eApiMessageType.USER_UPDATE_REQ) {
            await User.update({
                userNickname: req.body.data.userNickname,
                profileImageUrl: req.body.data.profileImageUrl,
                accountId: req.body.data.accountId,
                password: req.body.data.password,
                email: req.body.data.email,
                gender: req.body.data.gender,
                birth: req.body.data.birth,
                md5Mobile: req.body.data.md5Mobile,
                marketingAgreeTime: req.body.data.marketingAgreeTime,
                partnerId: req.body.data.partnerId,
                accessLevel: req.body.data.accessLevel,
                updatedAt: req.body.data.updatedAt
            }, {where: { userId: req.body.data.userId }});
            
            res.status(200).send({ status: 200, message: "success to update user info", data: {}});
        } else if (req.body.msgType === eApiMessageType.USER_FIND_ACCOUNT_ID_REQ) {
            const getRowUser = await User.findOne({
                where: { userNickname: req.body.data.userNickname, email: req.body.data.email  } 
            });
            console.log(getRowUser)
            res.status(200).send(getRowUser);
        } else if (req.body.msgType === eApiMessageType.USER_FIND_PASSWD_REQ) {
            const sendEmail = req.body.data.sendEmail
            const mailOptions = {
                from: "metaforest",
                to: sendEmail,
                subject: "인증메일 입니다",
                text: "인증번호 : " + authCode
            }

            smtpTransport.sendMail(mailOptions, (error, response) => {
                if (error) {
                    return res.status(200).send({ status: 500, message: "failed to send email"})
                } else {
                    return res.status(200).send({ status: 200, message: "success to send email"})
                }
                
            });
            res.status(200).send({ status: 200, message: "success to send email"});
        } else if (req.body.msgType === eApiMessageType.USER_CREATE_REQ) {
            // User 테이블에 생성하기
            await User.create({
                password: req.body.data.password,
                email: req.body.data.email,
                accessLevel: req.body.data.accessLevel,
            });
            
            res.status(200).send({ status: 200, message: "success to create admin", data: {}});
        } else if (req.body.msgType === eApiMessageType.USER_CHANGE_PASSWD_REQ) {
            await User.update({
                password: req.body.data.password,
                updatedAt: req.body.data.updatedAt
            }, {where: { userId: req.body.data.userId }});
            
            res.status(200).send({ status: 200, message: "success to change user password", data: {rows: getRowUser}});
        } else {
            res.status(200).send(null);
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});

/*
#1 매개변수 라우터 진행 시
router.get('/:id', (req, res) => {
    // params에서 매개변수를 확인 가능하다.
    console.log(req.params.id)
});

#2 쿼리스트링 라우터 진행 시
router.get('/:id?limit=5&skip=10', (req, res) => {
    // query에서 확인 가능하다.
    console.log(req.query.limit) - 5
    console.log(req.query.skip) - 10
});
*/

module.exports = router;