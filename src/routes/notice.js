const express = require('express');
const router = express.Router();
const { Notice, User } = require('../db/models');
// const { eApiMessageType } = require('../enums/apiMessageType');
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

const eApiMessageType = {
    NONE : 0,

    // NOTICE : 12
    USER_CREATE_NOTICE_REQ : 12001,
    USER_UPDATE_NOTICE_REQ : 12002,
    USER_DELETE_NOTICE_REQ : 12003,
    USER_GET_ONE_NOTICE_REQ : 12004,
    USER_GET_LIST_NOTICE_REQ : 12005,
    USER_GET_COUNT_NOTICE_REQ : 12006,
    USER_GET_LIST_NOTICE_BY_SEARCHWORD_REQ : 12007,
    
}

// POST /notice
router.post('/', isLoggedIn, async (req, res, next) => {
    // console.log(req);
    // console.log(req.user.dataValues.userId);
    let userIdFromReq = req.user.dataValues.userId;
    try {
        // login logout을 제외한 나머지 api 작업은 post로 해결. eApiMessageType 으로 분기. req.body.msgType 
        if (req.body.msgType === eApiMessageType.USER_GET_COUNT_NOTICE_REQ) {
            const getRowsNotice = await Notice.findAll({
                where: { isApproved: 'Y' },
                order: [['ordering', 'DESC']]
            });
            // console.log('getRowsNotice: ', getRowsNotice);
            res.status(200).send({ status: 200, message: "success to get count notice", data: {rows: getRowsNotice}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_NOTICE_REQ) {
            const getRowsNotice = await Notice.findAll({
                where: { isApproved: 'Y' },
                order: [['noticeId', 'DESC']],
                offset: 10 * (req.body.data.page - 1),
                limit: 10 
            });
            // console.log('getRowsNotice: ', getRowsNotice);
            res.status(200).send({ status: 200, message: "success to get list notice", data: {rows: getRowsNotice}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_NOTICE_BY_SEARCHWORD_REQ) {
            const searchWord = req.body.data.searchWord
            const searchKeyword = req.body.data.searchKeyword

            if (searchKeyword === 'title') {
                const getRowsNotice = await Notice.findAll({
                    // where: { isApproved: 'Y', title: {[Op.like]:'%' + searchWord + '%'} },
                    where: { isApproved: 'Y', title: {[Op.like]:'%' + searchWord + '%'} },
                    order: [['noticeId', 'DESC']],
                    offset: 10 * (req.body.data.page - 1),
                    limit: 10 
                });
                // console.log('getRowsNotice: ', getRowsNotice);
                res.status(200).send({ status: 200, message: "success to get list notice by search keyword title", data: {rows: getRowsNotice}});
            } else if (searchKeyword === 'content') {
                const getRowsNotice = await Notice.findAll({
                    // where: { isApproved: 'Y', content: {[Op.like]:'%' + searchWord + '%'} },
                    where: { isApproved: 'Y', title: {[Op.like]:'%' + searchWord + '%'} },
                    order: [['noticeId', 'DESC']],
                    offset: 10 * (req.body.data.page - 1),
                    limit: 10 
                });

                // console.log('getRowsNotice: ', getRowsNotice);
                
                res.status(200).send({ status: 200, message: "success to get list notice by search keyword content", data: {rows: getRowsNotice}});
            } else {
                res.status(200).send({ status: 400, message: "Bad Request"});
            }

            
        } else if (req.body.msgType === eApiMessageType.USER_GET_ONE_NOTICE_REQ) {
            const getRowsNotice = await Notice.findAll({
                where: { noticeId: req.body.data.noticeIds } 
            });
            // console.log('getRowsNotice: ', getRowsNotice);
            res.status(200).send({ status: 200, message: "success to get one notice", data: {rows: getRowsNotice}});
        } else if (req.body.msgType === eApiMessageType.USER_CREATE_NOTICE_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            // console.log('getRowUser', getRowUser);
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            const insertIdNotice = await Notice.create({
                title: req.body.data.title,
                content: req.body.data.content,
                isApproved: req.body.data.isApproved,
            });
            
            res.status(200).send({ status: 200, message: "success to update notice", data: insertIdNotice});
        } else if (req.body.msgType === eApiMessageType.USER_UPDATE_NOTICE_REQ) {
            const updateNotice = await Notice.update({
                title: req.body.data.title,
                content: req.body.data.content,
                isApproved: req.body.data.isApproved,
            }, {where: { noticeId: req.body.data.noticeId }});
            
            res.status(200).send({ status: 200, message: "success to update notice", data: updateNotice});
        } else if (req.body.msgType === eApiMessageType.USER_DELETE_NOTICE_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            // console.log('getRowUser', getRowUser.dataValues.accessLevel)
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            await Notice.destroy({
                where: { noticeId: req.body.data.noticeIds } 
            });
            
            res.status(200).send();
        } else {
            res.status(200).send(null);
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;