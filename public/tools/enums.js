
'use strict'

const eErrCode = {
    NONE: 0,
}

const eHttpStatus = {
    ok: 200,
    created: 201,
    accepted: 202,

    found: 302,

    badRequest: 400,
    unauthorized: 401,
    paymentRequired: 402,
    forbidden: 403,
    notFound: 404,
    methodNotAllowed: 405,
    conflict: 409,
    upgradeRequired: 426,

    internalServerError: 500,
    networkAuthenticationRequired: 511
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
    USER_UPDATE_NICKNAME_REQ : 11006,
    USER_UPDATE_PROFILE_IMAGE_URL_REQ : 11007,

    USER_CREATE_INQUIRY_REQ : 11008,
    USER_UPDATE_INQUIRY_REQ : 11009,
    USER_DELETE_INQUIRY_REQ : 11010,
    USER_GET_ONE_INQUIRY_REQ : 11011,
    USER_GET_LIST_INQUIRY_REQ : 11012,



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

}

