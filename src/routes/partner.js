const express = require('express');
const router = express.Router();
const { User, Partner } = require('../db/models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');

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

// GET /
router.get('', (req, res) => {
    res.send('OK');
});

// POST /partner
router.post('/verify', isNotLoggedIn, async (req, res, next) => {
    try {
        if (req.body.msgType === eApiMessageType.USER_VERIFY_PARTNER_CODE_REQ) {
            const getRowsPartner = await Partner.findOne({
                attributes: ['code'],
                where: { partnerId: req.body.data.partnerId } 
                
            });
            console.log('getRowsPartner: ', getRowsPartner);
            
            const codeFromDatabase = getRowsPartner.dataValues.code;
            const codeFromRequest = req.body.data.partnerCode;

            if (codeFromRequest !== codeFromDatabase) {
                res.status(200).send({ status: 400, message: "bad request", data: {}});
            }
            res.status(200).send({ status: 200, message: "success to get list partner", data: {}});
        } else {
            res.status(200).send(null);
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});

// POST /partner
router.post('/', isLoggedIn, async (req, res, next) => {
    let userIdFromReq = req.user.dataValues.userId;
    try {
        if (req.body.msgType === eApiMessageType.USER_CREATE_PARTNER_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            console.log('getRowUser', getRowUser);
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                res.status(200).send({ status: "Forbidden", errCode: 403, message: "Incorect accessLevel"});
            }

            const insertIdPartner = await Partner.create({
                partnerNickname: req.body.data.partnerNickname,
                code: req.body.data.code,
                plan: req.body.data.plan,
                planStartTime: req.body.data.planStartTime,
                planExpiryTime: req.body.data.planExpiryTime
            });
            
            res.status(200).json(insertIdPartner);
        } else if (req.body.msgType === eApiMessageType.USER_UPDATE_PARTNER_REQ) {
            await Partner.update({
                partnerNickname: req.body.data.partnerNickname,
                code: req.body.data.code,
                plan: req.body.data.plan,
                planStartTime: req.body.data.planStartTime,
                planExpiryTime: req.body.data.planExpiryTime,
                isApproved: req.body.data.isApproved
            }, {where: { partnerId: req.body.data.partnerId }});
            
            res.status(200).json();
        } else if (req.body.msgType === eApiMessageType.USER_DELETE_PARTNER_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            console.log('getRowUser', getRowUser.dataValues.accessLevel);
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, errCode: 403, message: "Incorect accessLevel"});
            }

            await Partner.destroy({
                where: { partnerId: req.body.data.partnerId } 
            });
            
            res.status(200).send();
        } else if (req.body.msgType === eApiMessageType.USER_GET_ONE_PARTNER_REQ) {
            const getRowPartner = await Partner.findOne({
                where: { partnerId: req.body.data.partnerId } 
            });
            console.log('getRowPartner: ', getRowPartner);
            if (getRowPartner === null) {
                return res.status(200).send({ status: 404, message: "failed to get partner info", data: {rows: getRowPartner}});
            }
            res.status(200).send({ status: 200, message: "success to get partner info", data: {rows: getRowPartner}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_PARTNER_REQ) {
            const getRowsPartner = await Partner.findAll({
                order: [['partnerId', 'DESC']],
            });
            console.log('getRowsPartner: ', getRowsPartner);
            res.status(200).send({ status: 200, message: "success to get list partner", data: {rows: getRowsPartner}});
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