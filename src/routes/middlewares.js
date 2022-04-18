exports.isLoggedIn = (req, res, next) => {
    console.log('isLoggedIn req.isAuthenticated : ', req.isAuthenticated())
    if (req.isAuthenticated()) {
        next();
    } else {
        // res.status(200).send('eErrCode 403: Login first'); // eErrCode 403
        res.status(200).json({ status: 403, errCode: 403, message: "Login first"}); // eErrCode 403
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    console.log('isNotLoggedIn req.isAuthenticated : ', req.isAuthenticated())
    if (!req.isAuthenticated()) {
        next();
    } else {
        // res.status(200).send('eErrCode 401: Logout first'); // eErrCode 401
        res.status(200).json({ status: 401, errCode: 401, message: "Logout first"}); // eErrCode 401
    }
};