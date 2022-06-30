const Sequelize = require('sequelize');
const User = require('./user');
// const Inquiry = require('./inquiry');
// const Event = require('./event');
const Notice = require('./notice');
const Faq = require('./faq');
const Partner = require('./partner');

const env = process.env.NODE_ENV || 'development';
const config = require('../config/config')[env];
const db = {};

// new Sequelize(..options)로 DB와 연결
// config 파일에 만든 내용
const sequelize = new Sequelize(config.database, config.username, config.password, config);

db.sequelize = sequelize;

// model 정보를 읽어온다.
db.User = User;
// db.Inquiry = Inquiry;
// db.Event = Event;
db.Notice = Notice;
db.Faq = Faq;
db.Partner = Partner;

User.init(sequelize);
// Inquiry.init(sequelize);
// Event.init(sequelize);
Notice.init(sequelize);
Faq.init(sequelize);
Partner.init(sequelize);

module.exports = db;