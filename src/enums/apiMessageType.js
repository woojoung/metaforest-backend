export const eApiMessageType = {
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

}