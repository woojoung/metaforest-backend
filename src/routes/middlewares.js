exports.isLoggedIn = (req, res, next) => {
    console.log('isLoggedIn', req, res, next)
    if (req.isAuthenticated()) {
        next();
    } else {
        // res.status(200).send('eErrCode 403: Login first'); // eErrCode 403
        res.status(200).json({ status: "Forbidden", errCode: 403, message: "Login first"}); // eErrCode 403
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        // res.status(200).send('eErrCode 401: Logout first'); // eErrCode 401
        res.status(200).json({ status: "Unauthorized", errCode: 401, message: "Logout first"}); // eErrCode 401
    }
};