const express = require('express');
const router = express.Router();
const { Notice, User, Partner, Faq } = require('../db/models');
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

    // SERVER_TEST
    SERVER_TEST_REQ : 10001,

    // ADMIN : 16
    ADMIN_CREATE_USER_REQ : 16001,
    ADMIN_UPDATE_USER_REQ : 16002,
    ADMIN_DELETE_USER_REQ : 16003,
    ADMIN_GET_ONE_USER_REQ : 16004,
    ADMIN_GET_LIST_USER_REQ : 16005,
    ADMIN_CHANGE_PASSWD_USER_REQ : 16006,

    ADMIN_CREATE_NOTICE_REQ : 16011,
    ADMIN_UPDATE_NOTICE_REQ : 16012,
    ADMIN_DELETE_NOTICE_REQ : 16013,
    ADMIN_GET_ONE_NOTICE_REQ : 16014,
    ADMIN_GET_LIST_NOTICE_REQ : 16015,

    ADMIN_CREATE_FAQ_REQ : 16021,
    ADMIN_UPDATE_FAQ_REQ : 16022,
    ADMIN_DELETE_FAQ_REQ : 16023,
    ADMIN_GET_ONE_FAQ_REQ : 16024,
    ADMIN_GET_LIST_FAQ_REQ : 16025,
    ADMIN_GET_COUNT_FAQ_REQ : 16026,

    ADMIN_CREATE_PARTNER_REQ : 16031,
    ADMIN_UPDATE_PARTNER_REQ : 16032,
    ADMIN_DELETE_PARTNER_REQ : 16033,
    ADMIN_GET_ONE_PARTNER_REQ : 16034,
    ADMIN_GET_LIST_PARTNER_REQ : 16035,

}

// POST /admin
router.post('/', isLoggedIn, async (req, res, next) => {
    // console.log(req);
    // console.log(req.user.dataValues.userId);
    let userIdFromReq = req.user.dataValues.userId;
    try {
        if (req.body.msgType === eApiMessageType.ADMIN_CREATE_USER_REQ) {
            // User 테이블에 생성하기
            await User.create({
                password: req.body.data.password,
                email: req.body.data.email,
                accessLevel: req.body.data.accessLevel,
            });
            
            res.status(200).send({ status: 200, message: "success to create admin", data: {}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_UPDATE_USER_REQ) {
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
            }, {where: { userId: req.body.data.userId }});
            
            res.status(200).send({ status: 200, message: "success to update user info", data: {}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_ONE_USER_REQ) {
            const getRowUser = await User.findOne({
                where: { userId: req.body.data.userId } 
            });
            // console.log(getRowUser)
            res.status(200).send({ status: 200, message: "success to get user info", data: {rows: getRowUser}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_LIST_USER_REQ) {

            let like1 = req.body.data.like1 ?? '';
            const keyword1 = req.body.data.keyword1 ?? '';
            const field1 = req.body.data.field1 ?? '';
            let orderBy = req.body.data.orderBy ?? '';
            const isAsc = req.body.data.isAsc ?? 'DESC';

            like1 = JSON.parse(like1);

            let getRowsUser = [];

            if (orderBy === '') {
                orderBy = User.primaryKeyAttribute;
            }

            if (like1 === true && field1 !== '' && keyword1 !== '') {
                getRowsUser = await User.findAll({
                    where: { [field1] : {[Op.like]: '%' + keyword1 + '%'} },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else if (like1 === false && field1 !== '' && keyword1 !== '') {
                getRowsUser = await User.findAll({
                    where: { [field1] : keyword1 },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else {
                getRowsUser = await User.findAll({
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            }
            

            // const getRowsUser = await User.findAll({
            //     order: [['userId', 'DESC']]
            // });

            const getRowsPartner = await Partner.findAll({
                order: [['partnerId', 'DESC']]
            });

            let partnerId = 0;
            const _partners = {};

            for (let i = 0; i < getRowsPartner.length; ++i) {
                partnerId = getRowsPartner[i].partnerId
                if (typeof partnerId !== 'undefined') {
                    _partners[partnerId] = getRowsPartner[i].partnerNickname
                }
            }

            getRowsUser.map((_rowUser) => {
                if (typeof _rowUser.partnerId !== 'undefined') {
                    if (_rowUser.partnerId in _partners) {
                        _rowUser.dataValues.partnerNickname = _partners[_rowUser.partnerId];
                    }
                }
            })

            res.status(200).send({ status: 200, message: "success to get list user", data: {rows: getRowsUser}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_CHANGE_PASSWD_USER_REQ) {
            const updateUser = await User.update({
                password: req.body.data.password
            }, {where: { email: req.body.data.email }});
            
            res.status(200).send({ status: 200, message: "success to change user password", data: updateUser});
        } else if (req.body.msgType === eApiMessageType.ADMIN_CREATE_NOTICE_REQ) {
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
                ordering: req.body.data.ordering,
                title: req.body.data.title,
                content: req.body.data.content,
                adminId: req.body.data.adminId,
                isApproved: req.body.data.isApproved,
            });
            
            res.status(200).send({ status: 200, message: "success to create notice", data: insertIdNotice});
        } else if (req.body.msgType === eApiMessageType.ADMIN_UPDATE_NOTICE_REQ) {
            const updateNotice = await Notice.update({
                ordering: req.body.data.ordering,
                title: req.body.data.title,
                content: req.body.data.content,
                adminId: req.body.data.adminId,
                isApproved: req.body.data.isApproved,
            }, {where: { noticeId: req.body.data.noticeId }});
            
            res.status(200).send({ status: 200, message: "success to update notice", data: updateNotice});
        } else if (req.body.msgType === eApiMessageType.ADMIN_DELETE_NOTICE_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            await Notice.destroy({
                where: { noticeId: req.body.data.noticeId } 
            });
            
            res.status(200).send({ status: 200, message: "success to delete notice", data: {} });
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_ONE_NOTICE_REQ) {
            const getRowNotice = await Notice.findOne({
                where: { noticeId: req.body.data.noticeId } 
            });

            res.status(200).send({ status: 200, message: "success to get one notice", data: {rows: getRowNotice}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_LIST_NOTICE_REQ) {

            let like1 = req.body.data.like1 ?? '';
            const keyword1 = req.body.data.keyword1 ?? '';
            const field1 = req.body.data.field1 ?? '';
            let orderBy = req.body.data.orderBy ?? '';
            const isAsc = req.body.data.isAsc ?? 'DESC';

            like1 = JSON.parse(like1);

            let getRowsNotice = [];

            if (orderBy === '') {
                orderBy = Notice.primaryKeyAttribute;
            }

            if (like1 === true && field1 !== '' && keyword1 !== '') {
                getRowsNotice = await Notice.findAll({
                    where: { [field1] : {[Op.like]: '%' + keyword1 + '%'} },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else if (like1 === false && field1 !== '' && keyword1 !== '') {
                getRowsNotice = await Notice.findAll({
                    where: { [field1] : keyword1 },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else {
                getRowsNotice = await Notice.findAll({
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            }

            res.status(200).send({ status: 200, message: "success to get list notice", data: {rows: getRowsNotice}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_CREATE_FAQ_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            // console.log('getRowUser', getRowUser);
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            const insertIdFaq = await Faq.create({
                ordering: req.body.data.ordering,
                category: req.body.data.category,
                title: req.body.data.title,
                content: req.body.data.content,
                adminId: req.body.data.adminId,
                isApproved: req.body.data.isApproved,
            });
            
            res.status(200).send({ status: 200, message: "success to create faq", data: insertIdFaq});
        } else if (req.body.msgType === eApiMessageType.ADMIN_UPDATE_FAQ_REQ) {
            const updateFaq = await Faq.update({
                ordering: req.body.data.ordering,
                category: req.body.data.category,
                title: req.body.data.title,
                content: req.body.data.content,
                adminId: req.body.data.adminId,
                isApproved: req.body.data.isApproved,
            }, {where: { faqId: req.body.data.faqId }});
            
            res.status(200).send({ status: 200, message: "success to update faq", data: updateFaq});
        } else if (req.body.msgType === eApiMessageType.ADMIN_DELETE_FAQ_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            await Faq.destroy({
                where: { faqId: req.body.data.faqId } 
            });
            
            res.status(200).send({ status: 200, message: "success to delete faq", data: {} });
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_ONE_FAQ_REQ) {
            const getRowFaq = await Faq.findOne({
                where: { faqId: req.body.data.faqId } 
            });

            res.status(200).send({ status: 200, message: "success to get one faq", data: {rows: getRowFaq}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_LIST_FAQ_REQ) {

            let like1 = req.body.data.like1 ?? '';
            const keyword1 = req.body.data.keyword1 ?? '';
            const field1 = req.body.data.field1 ?? '';
            let orderBy = req.body.data.orderBy ?? '';
            const isAsc = req.body.data.isAsc ?? 'DESC';

            like1 = JSON.parse(like1);

            let getRowsFaq = [];

            if (orderBy === '') {
                orderBy = Faq.primaryKeyAttribute;
            }

            if (like1 === true && field1 !== '' && keyword1 !== '') {
                getRowsFaq = await Faq.findAll({
                    where: { [field1] : {[Op.like]: '%' + keyword1 + '%'} },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else if (like1 === false && field1 !== '' && keyword1 !== '') {
                getRowsFaq = await Faq.findAll({
                    where: { [field1] : keyword1 },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else {
                getRowsFaq = await Faq.findAll({
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            }

            res.status(200).send({ status: 200, message: "success to get list faq", data: {rows: getRowsFaq}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_CREATE_PARTNER_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            // console.log('getRowUser', getRowUser);
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            const insertIdPartner = await Partner.create({
                partnerNickname: req.body.data.partnerNickname,
                code: req.body.data.code,
                plan: req.body.data.plan,
                planStartTime: req.body.data.planStartTime,
                planExpiryTime: req.body.data.planExpiryTime,
                isApproved: req.body.data.isApproved,
            });
            
            res.status(200).send({ status: 200, message: "success to create notice", data: insertIdPartner});
        } else if (req.body.msgType === eApiMessageType.ADMIN_UPDATE_PARTNER_REQ) {
            const updatePartner = await Partner.update({
                partnerNickname: req.body.data.partnerNickname,
                code: req.body.data.code,
                plan: req.body.data.plan,
                planStartTime: req.body.data.planStartTime,
                planExpiryTime: req.body.data.planExpiryTime,
                isApproved: req.body.data.isApproved,
            }, {where: { partnerId: req.body.data.partnerId }});
            
            res.status(200).send({ status: 200, message: "success to update partner", data: updatePartner});
        } else if (req.body.msgType === eApiMessageType.ADMIN_DELETE_PARTNER_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            await Partner.destroy({
                where: { partnerId: req.body.data.partnerId } 
            });
            
            res.status(200).send({ status: 200, message: "success to delete partner", data: {} });
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_ONE_PARTNER_REQ) {
            const getRowPartner = await Partner.findOne({
                where: { partnerId: req.body.data.partnerId } 
            });

            res.status(200).send({ status: 200, message: "success to get one partner", data: {rows: getRowPartner}});
        } else if (req.body.msgType === eApiMessageType.ADMIN_GET_LIST_PARTNER_REQ) {

            let like1 = req.body.data.like1 ?? '';
            const keyword1 = req.body.data.keyword1 ?? '';
            const field1 = req.body.data.field1 ?? '';
            let orderBy = req.body.data.orderBy ?? '';
            const isAsc = req.body.data.isAsc ?? 'DESC';

            like1 = JSON.parse(like1);

            let getRowsPartner = [];

            if (orderBy === '') {
                orderBy = Partner.primaryKeyAttribute;
            }

            if (like1 === true && field1 !== '' && keyword1 !== '') {
                getRowsPartner = await Partner.findAll({
                    where: { [field1] : {[Op.like]: '%' + keyword1 + '%'} },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else if (like1 === false && field1 !== '' && keyword1 !== '') {
                getRowsPartner = await Partner.findAll({
                    where: { [field1] : keyword1 },
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            } else {
                getRowsPartner = await Partner.findAll({
                    order: [[orderBy, isAsc]],
                    offset: req.body.data.offset,
                    limit: req.body.data.limit
                });
            }

            let partnerId = 0;
            let userCount = 0;
            const _users = {};

            for (let i = 0; i < getRowsPartner.length; ++i) {
                partnerId = getRowsPartner[i].partnerId;
                userCount = await User.count({
                    where: { partnerId: partnerId }
                });
                _users[partnerId] = userCount;
            }

            getRowsPartner.map((_rowPartner) => {
                if (_rowPartner.partnerId in _users) {
                    _rowPartner.dataValues.userCount = _users[_rowPartner.partnerId];
                }
            })

            res.status(200).send({ status: 200, message: "success to get list partner", data: {rows: getRowsPartner}});
        } else {
            res.status(200).send(null);
        }
    } catch(error) {
        console.error(error);
        next(error);
    }
});

module.exports = router;