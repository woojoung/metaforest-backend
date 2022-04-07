// const Sequelize = require('sequelize');

// module.exports = class Admin extends Sequelize.Model {
//     static init(sequelize) {
//         return super.init({
//             adminId: {
//                 type: Sequelize.STRING(50),
//                 allowNull: false,
//                 primaryKey: true,
//                 comment: '관리자 이메일'
//             },
//             password: {
//                 type: Sequelize.STRING(32),
//                 allowNull: false,
//                 comment: '비밀번호'
//             },
//             accessLevel: {
//                 type: Sequelize.INTEGER(11),
//                 allowNull: false,
//                 defaultValue: '0',
//                 comment: '권한 레벨'
//             }
//         },{
//             sequelize,
//             timestamps: true, // createAt, updateAt 자동 생성
//             underscored: false, // sequelize에서 _ 사용할지 말지 ex) createAt -> create_at
//             paranoid: true, // deleteAt을 생성 (삭제한 날짜)
//             modelName: 'Admin', // modelName - javascript에서 쓰인다.
//             tableName: 'admins', // tableName - SQL에서 쓰이며, modelName의 소문자로 하고, 복수형으로 짓는다.
//             charset: 'utf8',
//             collate: 'utf8_general_ci',
//         });
//     }
// };