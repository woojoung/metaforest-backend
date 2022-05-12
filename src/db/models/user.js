const Sequelize = require('sequelize');

module.exports = class User extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            userId: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                comment: '사용자 아이디'
            },
            userNickname: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '사용자 닉네임'
            },
            profileImageUrl: {
                type: Sequelize.STRING(192),
                allowNull: false,
                defaultValue: '',
                comment: '사용자 프로필 이미지'
            },
            accountId: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '아이디'
            },
            password: {
                type: Sequelize.STRING(32),
                allowNull: false,
                defaultValue: '',
                comment: '비밀번호'
            },
            email: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '이메일'
            },
            gender: {
                type: Sequelize.STRING(1),
                allowNull: false,
                defaultValue: '',
                comment: '성별'
            },
            birth: {
                type: Sequelize.STRING(10),
                allowNull: false,
                defaultValue: '1970-01-01',
                comment: '생년월일'
            },
            md5Mobile: {
                type: Sequelize.STRING(32),
                allowNull: false,
                defaultValue: '',
                comment: '휴대폰번호'
            },
            marketingAgreeTime: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                defaultValue: '-1',
                comment: '개인정보 동의'
            },
            partnerId: {
                type: Sequelize.INTEGER(20),
                allowNull: false,
                defaultValue: '0',
                comment: '기관 번호'
            },
            accessLevel: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: '0',
                comment: '권한 레벨'
            }
        },{
            indexes: [{type: 'UNIQUE', fields: ['userNickname']}],
            sequelize,
            timestamps: true, // createAt, updateAt 자동 생성
            underscored: false, // sequelize에서 _ 사용할지 말지 ex) createAt -> create_at
            paranoid: true, // deleteAt을 생성 (삭제한 날짜)
            modelName: 'User', // modelName - javascript에서 쓰인다.
            tableName: 'users', // tableName - SQL에서 쓰이며, modelName의 소문자로 하고, 복수형으로 짓는다.
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
};