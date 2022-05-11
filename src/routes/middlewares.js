exports.isLoggedIn = (req, res, next) => {
    // console.log('isLoggedIn req.isAuthenticated : ', req.isAuthenticated())
    // console.log('isLoggedIn req.user : ', req.user)
    if (req.isAuthenticated()) {
        next(); // 로그인 상태면 다음 미들웨어 호출
    } else {
        res.status(200).send({ status: 403, errCode: 403, message: "Login first"});
        // res.status(200).json({ status: 403, errCode: 403, message: "Login first"});
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    // console.log('isNotLoggedIn req.isAuthenticated : ', req.isAuthenticated())
    // console.log('isNotLoggedIn req.user : ', req.user)
    if (!req.isAuthenticated()) {
        next();
    } else {
        res.status(200).send({ status: 401, errCode: 401, message: "Logout first"});
        // res.status(200).json({ status: 401, errCode: 401, message: "Logout first"});
    }
};