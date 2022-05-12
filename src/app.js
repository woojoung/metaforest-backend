const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const passportConfig = require('./passport/index');
const passport = require('passport');

const MySQLStore = require('express-mysql-session')(session);

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

app.set('trust proxy', 1);

if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

const sessionStore = new MySQLStore({
    host: '127.0.0.1',
    port: 3306,
    user: 'admin',
    password: process.env.DB_PASSWORD,
    database: 'session_test'
});


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS 미들웨어 등록
app.use(cors({
    origin: ['http://localhost:5500','http://127.0.0.1:5500','https://metaforest.us', 'http://localhost:7074', 'http://127.0.0.1:7074', 'https://admin.metaforest.us', 'https://www.metaforest.us'],
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS']
}));


app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    proxy: true,
    store: sessionStore,
    cookie: {
        httpOnly: true,
        // secure: true,
        maxAge: 1000 * 60 * 60 * 5,
        // sameSite: 'none',
        domain: '.metaforest.us'
    },
    name: 'meta_sid',
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/user', userRouter);
app.use('/auth', authRouter);
app.use('/notice', noticeRouter);
app.use('/faq', faqRouter);
app.use('/partner', partnerRouter);

app.get('', (req, res) => {
    res.send('<h1>OK</h1>');
});

app.listen(app.get('port'), () => {
    console.log('Listening on port:', app.get('port'));
});