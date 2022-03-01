const express = require('express');
const { User, Admin } = require('../db/models');
// const { eAccessLevel } = require('../enums/accessLevel')
const passport = require('passport');

const router = express.Router();
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

// GET /
router.get('/', (req, res) => {
    res.send('OK');
});

// 회원가입 
// POST /signup
router.post('/signup', isNotLoggedIn, async (req, res, next) => { // POST /signup/
    try {
        const exEmail = await User.findOne({ // 이메일 검사
            where: {
                email: req.body.data.email,
            }
        });
        const exNickname = await User.findOne({ // 이메일 검사
            where: {
                userNickname: req.body.data.userNickname,
            }
        });
        if (exEmail) {
            // return으로 res(응답)을 한번만 보내도록 한다. 응답 후 router 종료된다.
            return res.status(200).send('used email');
        }
        if (exNickname) {
            return res.status(200).send('used nickname');
        }

        // User 테이블에 생성하기
        await User.create({
            userNickname: req.body.data.userNickname,
            profileImageUrl: req.body.data.profileImageUrl,
            accountId: req.body.data.accountId,
            password: req.body.data.password,
            email: req.body.data.email,
            gender: req.body.data.gender,
            birth: req.body.data.birth,
            md5Mobile: req.body.data.md5Mobile,
            accessLevel: eAccessLevel.USER,
        });
        // 요청에 대한 성공으로 status(201) : 생성이 됐다는 의미 (기재하는게 좋다.)
        res.status(201).send('create User!');
    } catch(err) {
        console.error(err);
        next(err); // status(500) - 서버에러
    }
});

// 로그인
// 미들웨어 확장법 (req, res, next를 사용하기 위해서)
// passport index.js에서 전달되는 done의 세가지 인자를 받는다.
router.post('/login', isNotLoggedIn, (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { // 서버 에러
            console.error(err);
            return next(err);
        }
        if (info) { // 클라이언트 에러 (비밀번호가 틀렸거나, 계정이 없거나), info.message에 에러 내용이 있음.
            
            res.status(403).send(info);
        }
        // req.login하면 serializeUser 실행
        // 아래는 passport에서 serializeUser 통과 후  if문부터 실행
        return req.login(user, async (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }
            // 비밀번호를 제외한 모든 정보 가져오기
            const fullUserWithoutPassword = await User.findOne({
                where: { email: user.email },
                attributes: {
                    exclude: ['password'], // exclude: 제외한 나머지 정보 가져오기
                }
            });
            // req.session.save((err) => {
            //     if (err) {
            //       console.error(err)
            //       next(err)
            //     } else {
            //       res.redirect(`/user`)
            //     }
            //   })
            // 세션쿠키와 json 데이터를 브라우저로 보내준다.
            return res.status(200).send(fullUserWithoutPassword);
        });
    })(req, res, next);
});

// 로그아웃
// POST /logout/
router.post('/logout', isLoggedIn, (req, res) => {
    req.logOut();
    req.session.destroy();
    res.send('로그아웃');
});

// 카카오 개발 앱 설정 중 Redirect URI에 적는 주소
// GET /ouath
// 카카오 로그인 페이지에서 로그인 후 아래에서 카카오 Strategy가 실행되며, kakao.js 모듈 실행
// router.get('/ouath', passport.authenticate('kakao', {
//     failureRedirect: '/',
// }), (req, res) => {
//     res.redirect('http://localhost:3000');
// });

module.exports = router;