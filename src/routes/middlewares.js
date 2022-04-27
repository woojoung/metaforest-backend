export function isLoggedIn(req, res, next) {
    console.log('isLoggedIn req.isAuthenticated : ', req.isAuthenticated())
    console.log('isLoggedIn req.user : ', req.user)
    if (req.isAuthenticated()) {
        next(); // 로그인 상태면 다음 미들웨어 호출
    } else {
        // res.status(200).send('eErrCode 403: Login first'); // eErrCode 403
        res.status(200).json({ status: 403, errCode: 403, message: "Login first"}); // eErrCode 403
    }
}

export function isNotLoggedIn(req, res, next) {
    console.log('isNotLoggedIn req.isAuthenticated : ', req.isAuthenticated())
    console.log('isNotLoggedIn req.user : ', req.user)
    if (!req.isAuthenticated()) {
        next();
    } else {
        // res.status(200).send('eErrCode 401: Logout first'); // eErrCode 401
        res.status(200).json({ status: 401, errCode: 401, message: "Logout first"}); // eErrCode 401
    }
}