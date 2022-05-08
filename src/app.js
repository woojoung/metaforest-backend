const express = require('express');
const session = require('express-session');
const path = require('path');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const passportConfig = require('./passport/index');
const passport = require('passport');

// const MySQLStore = require('express-mysql-session')(session);


// load database
const { sequelize } = require('./db/models/index');

// load router
const userRouter = require('./routes/user');
const authRouter = require('./routes/auth');
const noticeRouter = require('./routes/notice');
const faqRouter = require('./routes/faq');
const partnerRouter = require('./routes/partner');

// process.env 의 secret 연결
dotenv.config();
const app = express();
passportConfig(); // passport 내부 js 모듈 실행

// connect database
sequelize.sync({ force: false })
    .then(() => {
        console.log('database connection is successful');
    })
    .catch((err) => {
        console.error(err);
    })


app.set('port', process.env.PORT || 7071);

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// req.body에서 바로 꺼내서 데이터를 확인할 수 있다. (필수 장착)
// json - 클라이언트에서 받은 데이터를 json으로 보내줄 경우 json으로 파싱해서 req.body로 데이터를 넣어준다.
app.use(express.json());
// urlencoded - 클라이언트에서 form submit으로 보낼 때 form parsing을 받을 때 쓰인다.
app.use(express.urlencoded({ extended: true }));

// CORS 미들웨어 등록
app.use(cors({
    origin: ['http://localhost:5500','http://127.0.0.1:5500','https://metaforest.us', 'http://localhost:7074', 'http://127.0.0.1:7074', 'https://admin.metaforest.us', 'https://wwww.metaforest.us'],
    // origin: true,
    // allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, authorization',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
}));

app.set('trust proxy', 1);

// 로그인 시 아래 4개의 미들웨어 필요
app.use(cookieParser(process.env.COOKIE_SECRET));
// session 불러오기 : 요청 시 개인의 저장공간을 만들어준다.
app.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.COOKIE_SECRET,
    proxy: true,
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 1000 * 60 * 60 * 1,
        sameSite: 'none',
    },
    name: 'meta_sid',
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
app.use('/partner', partnerRouter); // /faq

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
    res.send('<h1>OK</h1>');
});

app.listen(app.get('port'), () => {
    console.log('Listening on port:', app.get('port'));
});