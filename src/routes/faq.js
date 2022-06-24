const express = require('express');
const router = express.Router();
const { User, Faq } = require('../db/models');
const { isLoggedIn } = require('./middlewares');

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
    PROGRAM_USAGE : 10,
    COUNSELING : 20,
    PARTNER_REGISTRATION : 30,
    MEMBERSHIP : 40,
    ETC : 50,
}

const eApiMessageType = {
    NONE : 0,

    // FAQ : 14
    USER_CREATE_FAQ_REQ : 14001,
    USER_UPDATE_FAQ_REQ : 14002,
    USER_DELETE_FAQ_REQ : 14003,
    USER_GET_ONE_FAQ_REQ : 14004,
    USER_GET_LIST_FAQ_REQ : 14005,
    USER_GET_COUNT_FAQ_REQ : 14006,
    USER_GET_LIST_FAQ_BY_CATEGORY_REQ : 14007,

}

// POST /faq
router.post('/', isLoggedIn, async (req, res, next) => {
    // console.log(req);
    // console.log(req.user.dataValues.userId);
    let userIdFromReq = req.user.dataValues.userId;
    try {
        // login logout을 제외한 나머지 api 작업은 post로 해결. eApiMessageType 으로 분기. req.body.msgType 
        // api가 증가하면, api 디렉토리 depth 하나 더 추가해서 switch 문으로 분기하는 방법 고려.
        if (req.body.msgType === eApiMessageType.USER_GET_COUNT_FAQ_REQ) {
            const getRowsFaq = await Faq.findAll({
                where: { isApproved: 'Y' },
                order: [['ordering', 'DESC']]
            });
            
            // res.status(200).send(getRowsFaq);
            res.status(200).send({ status: 200, message: "success to get count faq", data: {rows: getRowsFaq}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_FAQ_REQ) {
            const getRowFaq = await Faq.findAll({
                where: { isApproved: 'Y' },
                order: [['faqId', 'DESC']],
                offset: 10 * (req.body.data.page - 1),
                limit: 10 
            });
            
            // res.status(200).send(getRowFaq);
            res.status(200).send({ status: 200, message: "success to get list faq", data: {rows: getRowFaq}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_FAQ_BY_CATEGORY_REQ) {
            const getRowFaq = await Faq.findAll({
                where: { isApproved: 'Y', category: req.body.data.category },
                order: [['faqId', 'DESC']],
                offset: 10 * (req.body.data.page - 1),
                limit: 10 
            });
            
            // res.status(200).send(getRowFaq);
            res.status(200).send({ status: 200, message: "success to get list faq by category", data: {rows: getRowFaq}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_ONE_FAQ_REQ) {
            const getRowFaq = await Faq.findOne({
                where: { userId: req.body.data.faqId } 
            });
            
            // res.status(200).send(getRowFaq);
            res.status(200).send({ status: 200, message: "success to get one faq", data: {rows: getRowFaq}});
        } else if (req.body.msgType === eApiMessageType.USER_CREATE_FAQ_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            // console.log('getRowUser', getRowUser.dataValues.accessLevel)
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, errCode: 403, message: "Forbidden, Incorect accessLevel"});
            }

            const insertIdFaq = await Faq.create({
                ordering: req.body.data.ordering,
                category: req.body.data.category,
                title: req.body.data.title,
                content: req.body.data.content,
                // adminId: userIdFromReq, //userId
                isApproved: req.body.data.isApproved,
            });
            
            // res.status(200).send(insertIdFaq);
            res.status(200).send({ status: 200, message: "success to update faq", data: insertIdFaq});
        } else if (req.body.msgType === eApiMessageType.USER_UPDATE_FAQ_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            // console.log('getRowUser', getRowUser[0].dataValues.accessLevel)
            const userAccessLevel = getRowUser[0].dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                res.status(200).send({ status: 403, errCode: 403, message: "Forbidden, Incorect accessLevel"});
            }

            const updateFaq = await Faq.update({
                ordering: req.body.data.ordering,
                category: req.body.data.category,
                title: req.body.data.title,
                content: req.body.data.content,
                // adminId: req.body.data.adminId,
                isApproved: req.body.data.isApproved,
                updatedAt: req.body.data.updatedAt
            }, {where: { faqId: req.body.data.faqId }});
            
            res.status(200).send({ status: 200, message: "success to update faq", data: updateFaq});
        } else {
            res.status(200).send(null);
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;