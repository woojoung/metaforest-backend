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
            // console.log('getRowsPartner: ', getRowsPartner);
            
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

            // console.log('getRowUser', getRowUser);
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            const insertIdPartner = await Partner.create({
                partnerNickname: req.body.data.partnerNickname,
                code: req.body.data.code,
                plan: req.body.data.plan,
                planStartTime: req.body.data.planStartTime,
                planExpiryTime: req.body.data.planExpiryTime,
                isApproved: req.body.data.isApproved
            });
            
            res.status(200).send({ status: 200, message: "Incorect accessLevel", data: insertIdPartner});
        } else if (req.body.msgType === eApiMessageType.USER_UPDATE_PARTNER_REQ) {
            await Partner.update({
                partnerNickname: req.body.data.partnerNickname,
                code: req.body.data.code,
                plan: req.body.data.plan,
                planStartTime: req.body.data.planStartTime,
                planExpiryTime: req.body.data.planExpiryTime,
                isApproved: req.body.data.isApproved
            }, {where: { partnerId: req.body.data.partnerId }});
            
            res.status(200).send();
        } else if (req.body.msgType === eApiMessageType.USER_DELETE_PARTNER_REQ) {
            const getRowUser = await User.findOne({
                attributes: ['accessLevel'],
                where: { userId: userIdFromReq } 
            });

            // console.log('getRowUser', getRowUser.dataValues.accessLevel);
            const userAccessLevel = getRowUser.dataValues.accessLevel;

            if (userAccessLevel < eAccessLevel.SERVICE_OPERATOR) {
                return res.status(200).send({ status: 403, message: "Incorect accessLevel"});
            }

            await Partner.destroy({
                where: { partnerId: req.body.data.partnerId } 
            });
            
            res.status(200).send();
        } else if (req.body.msgType === eApiMessageType.USER_GET_ONE_PARTNER_REQ) {
            const getRowPartner = await Partner.findOne({
                where: { partnerId: req.body.data.partnerId } 
            });
            // console.log('getRowPartner: ', getRowPartner);
            if (getRowPartner === null) {
                return res.status(200).send({ status: 404, message: "failed to get partner info", data: {rows: getRowPartner}});
            }
            res.status(200).send({ status: 200, message: "success to get partner info", data: {rows: getRowPartner}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_LIST_PARTNER_REQ) {
            const getRowsPartner = await Partner.findAll({
                order: [['partnerId', 'DESC']],
            });

            // const getRowsUser = await User.findAll({
            //     order: [['userId', 'DESC']]
            // });

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

            // console.log('getRowsPartner: ', getRowsPartner);
            res.status(200).send({ status: 200, message: "success to get list partner", data: {rows: getRowsPartner}});
        } else if (req.body.msgType === eApiMessageType.USER_GET_COUNT_PARTNER_REQ) {
            const getRowsPartner = await Partner.findAll({
                order: [['partnerId', 'DESC']]
            });
            // console.log('getRowsPartner: ', getRowsPartner);
            res.status(200).send({ status: 200, message: "success to get count partner", data: {rows: getRowsPartner}});
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