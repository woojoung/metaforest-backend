const Sequelize = require('sequelize');

module.exports = class Inquiry extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            inquiryId: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true
            },
            inquiryIdGroup: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                defaultValue: '0',
                comment: '번호그룹'
            },
            title: {
                type: Sequelize.STRING(192),
                allowNull: false,
                defaultValue: '',
                comment: '제목'
            },
            content: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: '내용'
            },
            reply: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: '답변'
            },
            extraInfo: {
                type: Sequelize.TEXT,
                allowNull: false,
                comment: '추가정보(JSON)'
            },
            email: {
                type: Sequelize.STRING(192),
                allowNull: false,
                defaultValue: '',
                comment: '이메일'
            },
            userId: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                defaultValue: '0',
                comment: '사용자 아이디'
            },
            counselorId: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                defaultValue: '0',
                comment: '상담가 아이디'
            },
            adminId: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '관리자'
            },
        },{
            indexes: [{type: 'INDEX', fields: ['inquiryIdGroup']}],
            sequelize,
            timestamps: true, // createAt, updateAt 자동 생성
            underscored: false, // sequelize에서 _ 사용할지 말지 ex) createAt -> create_at
            paranoid: true, // deleteAt을 생성 (삭제한 날짜)
            modelName: 'Inquiry', // modelName - javascript에서 쓰인다.
            tableName: 'inquiries', // tableName - SQL에서 쓰이며, modelName의 소문자로 하고, 복수형으로 짓는다.
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
};