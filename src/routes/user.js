const express = require('express');
const router = express.Router();
const { User } = require('../db/models');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
// const { eAccessLevel } = require('../enums/accessLevel')

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

    USER_CREATE_INQUIRY_REQ : 11008,
    USER_UPDATE_INQUIRY_REQ : 11009,
    USER_DELETE_INQUIRY_REQ : 11010,
    USER_GET_ONE_INQUIRY_REQ : 11011,
    USER_GET_LIST_INQUIRY_REQ : 11012,

    USER_GET_ONE_NOTICE_REQ : 11013,
    USER_GET_LIST_NOTICE_REQ : 11014,
    USER_GET_COUNT_NOTICE_REQ : 11015,

    USER_GET_ONE_FAQ_REQ : 11016,
    USER_GET_LIST_FAQ_REQ : 11017,
    USER_GET_COUNT_FAQ_REQ : 11018,
    USER_GET_LIST_FAQ_BY_CATEGORY_REQ : 11019,



    // ADMIN: 12
    ADMIN_LOGIN_REQ : 12001,
    ADMIN_LOGOUT_REQ : 12002,
    ADMIN_CHANGE_PASSWD_REQ : 12003,
    ADMIN_CREATE_ADMIN_REQ : 12004,
    ADMIN_UPDATE_ADMIN_REQ : 12005,
    ADMIN_DELETE_ADMIN_REQ : 12006,
    ADMIN_GET_ONE_ADMIN_REQ : 12007,
    ADMIN_DECRYPT_SESSION_REQ : 12008,

    ADMIN_CREATE_INQUIRY_REQ : 12009,
    ADMIN_UPDATE_INQUIRY_REQ : 12010,
    ADMIN_DELETE_INQUIRY_REQ : 12011,
    ADMIN_GET_ONE_INQUIRY_REQ : 12012,
    ADMIN_GET_LIST_INQUIRY_REQ : 12013,

    ADMIN_CREATE_NOTICE_REQ : 12014,
    ADMIN_UPDATE_NOTICE_REQ : 12015,
    ADMIN_DELETE_NOTICE_REQ : 12016,
    ADMIN_GET_ONE_NOTICE_REQ : 12017,
    ADMIN_GET_LIST_NOTICE_REQ : 12018,

    ADMIN_CREATE_FAQ_REQ : 12019,
    ADMIN_UPDATE_FAQ_REQ : 12020,
    ADMIN_DELETE_FAQ_REQ : 12021,
    ADMIN_GET_ONE_FAQ_REQ : 12022,
    ADMIN_GET_LIST_FAQ_REQ : 12023,

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
            res.status(200).json(fullUserWithoutPassword);
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
            const getRowsUser = await User.findAll({
                order: [['userId', 'DESC']]
            });
            
            res.status(200).json(getRowsUser);
        } else if (req.body.msgType === eApiMessageType.USER_GET_ONE_INFO_REQ) {
            const getRowUser = await User.findOne({
                where: { userId: req.body.data.userId } 
            });
            console.log(getRowUser)
            res.status(200).send(getRowUser);
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
                accessLevel: req.body.data.accessLevel
            }, {where: { userId: req.body.data.userId }});
            
            res.status(200).json('');
        } else {
            res.status(200).json(null);
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