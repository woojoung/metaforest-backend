const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const passportConfig = require('./passport/index');
const passport = require('passport');

// load database
// const { sequelize } = require('./db/models/index');

// load router
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const noticeRouter = require('./routes/notice');
const faqRouter = require('./routes/faq');

// process.env 의 secret 연결
dotenv.config();
const app = express();

// connect database
// sequelize.sync({ force: false })
//     .then(() => {
//         console.log('database connection is successful');
//     })
//     .catch((err) => {
//         console.error(err);
//     })

passportConfig(); // passport 내부 js 모듈 실행
app.set('port', process.env.PORT || 7071);

app.use(morgan('dev'));


// req.body에서 바로 꺼내서 데이터를 확인할 수 있다. (필수 장착)
// json - 클라이언트에서 받은 데이터를 json으로 보내줄 경우 json으로 파싱해서 req.body로 데이터를 넣어준다.
app.use(express.json());
// urlencoded - 클라이언트에서 form submit으로 보낼 때 form parsing을 받을 때 쓰인다.
app.use(express.urlencoded({ extended: true }));

// CORS 미들웨어 등록
app.use(cors({
    origin: ['http://localhost:5500','http://127.0.0.1:5500','https://metaforest.us', 'http://localhost:7074', 'http://127.0.0.1:7074'], // '*' 모든 URL에서 접근 가능 / 단 아래 속성 true일 경우는 주소로 적어야한다.(보안강화)
    credentials: true, // front, back 간 쿠키 공유
}));

// 로그인 시 아래 4개의 미들웨어 필요
app.use(cookieParser(process.env.COOKIE_SECRET));
// session 불러오기 : 요청 시 개인의 저장공간을 만들어준다.
app.use(session({
    resave: false, // 세션이 수정되지 않아도 항상 저장할지 확인하는 옵션
    saveUninitialized: true, // 세션이 unInitialized 상태로 미리 만들어서 저장하는지 묻는 옵션
    secret: process.env.COOKIE_SECRET,
    cookie: {
        httpOnly: true, // 항상 true(자바스크립트로 진입 불가)
        secure: false,
        maxAge: 60 * 60 * 24,
    },
    rolling: true
}));

// 초기화
app.use(passport.initialize());
// 세션에서 로그인 정보 복구
app.use(passport.session());

// req.cookies;
// res.cookie('name', encodeURIComponent('name'), {
//     expires: new Date(),
//     httpOnly: true,
//     path: '/',
// });
// res.clearCookie('name', encodeURIComponent('name'), {
//     httpOnly: true,
//     path: '/',
// });
// req.session.id = 'hello';

app.use('/user', userRouter); // /user
app.use('/auth', authRouter); // /auth
app.use('/notice', noticeRouter); // /notice
app.use('/faq', faqRouter); // /faq

// // 404 처리 미들웨어
// app.use((req, res, next) => {
//     console.log('404 에러');
//     res.status(404).send('Not Found');
// });

// // 에러 처리 미들웨어
// app.use((err, req, res, next) => {
//     console.error(err);
//     res.status(err.status || 500).send(err.message);
// });

app.get('', (req, res) => {
    res.sendFile(__dirname + '/public/index.html')
});

app.listen(app.get('port'), () => {
    console.log('Listening on port:', app.get('port'));
});