const express = require('express');
const router = express.Router();
const { Notice, User, Faq } = require('../db/models');
// const { eApiMessageType } = require('../enums/apiMessageType');
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

const eFaqCategory = {
    NONE : 0,
    ONE_TO_ONE : 10,
    GROUP : 20,
    EAP : 30,
    TUTORIAL : 40,
    COMMUNITY : 50,
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

}

// POST /faq
router.post('/', isLoggedIn, async (req, res, next) => {
    console.log(req);
    console.log(req.user.dataValues.userId);
    let userIdFromReq = req.user.dataValues.userId;
    try {
        // login logout을 제외한 나머지 api 작업은 post로 해결. eApiMessageType 으로 분기. req.body.msgType 
        if (req.body.msgType === eApiMessageType.USER_GET_COUNT_FAQ_REQ) {
            const getRowsFaq = await Faq.findAll({
                order: [['ordering', 'DESC']]
            });
            
            res.status(200).json(getRowsFaq);
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_FAQ_REQ) {
            const getRowFaq = await Faq.findAll({
                where: { isApproved: 'Y' },
                order: [['faqId', 'DESC']],
                offset: 10 * (req.body.data.page - 1),
                limit: 10 
            });
            
            res.status(200).json(getRowFaq);
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_FAQ_BY_CATEGORY_REQ) {
            const getRowFaq = await Faq.findAll({
                where: { isApproved: 'Y', categoty: req.body.data.category },
                order: [['faqId', 'DESC']],
                offset: 10 * (req.body.data.page - 1),
                limit: 10 
            });
            
            res.status(200).json(getRowFaq);
        } else if (req.body.msgType === eApiMessageType.USER_GET_ONE_FAQ_REQ) {
            const getRowFaq = await Faq.findOne({
                where: { userId: req.body.data.faqId } 
            });
            
            res.status(200).json(getRowFaq);
        } else if (req.body.msgType === eApiMessageType.USER_CREATE_FAQ_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            console.log('getRowUser', getRowUser[0].dataValues.accessLevel)
            const userAccessLevel = getRowUser[0].dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                res.status(200).json({ status: "Forbidden", errCode: 403, message: "Incorect accessLevel"});
            }

            const insertIdFaq = await Faq.create({
                ordering: req.body.data.ordering,
                category: req.body.data.category,
                title: req.body.data.title,
                content: req.body.data.content,
                adminId: req.body.data.adminId,
                isApproved: req.body.data.isApproved,
            });
            
            res.status(200).json(insertIdFaq);
        } else if (req.body.msgType === eApiMessageType.USER_UPDATE_FAQ_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            console.log('getRowUser', getRowUser[0].dataValues.accessLevel)
            const userAccessLevel = getRowUser[0].dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                res.status(200).json({ status: "Forbidden", errCode: 403, message: "Incorect accessLevel"});
            }

            await Faq.update({
                ordering: req.body.data.ordering,
                category: req.body.data.category,
                title: req.body.data.title,
                content: req.body.data.content,
                adminId: req.body.data.adminId,
                isApproved: req.body.data.isApproved,
            }, {where: { noticeId: req.body.data.noticeId }});
            
            res.status(200).json();
        } else {
            res.status(200).json(null);
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;