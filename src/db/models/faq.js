const Sequelize = require('sequelize');

module.exports = class Faq extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            faqId: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                comment: '번호'
            },
            ordering: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: '0',
                comment: '상단고정'
            },
            category: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: '0',
                comment: '분류'
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
            adminId: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '관리자'
            },
            isApproved: {
                type: Sequelize.STRING(1),
                allowNull: false,
                defaultValue: 'N',
                comment: '승인여부'
            },
        },{
            sequelize,
            timestamps: true, // createAt, updateAt 자동 생성
            underscored: false, // sequelize에서 _ 사용할지 말지 ex) createAt -> create_at
            paranoid: true, // deleteAt을 생성 (삭제한 날짜)
            modelName: 'Faqs', // modelName - javascript에서 쓰인다.
            tableName: 'faqs', // tableName - SQL에서 쓰이며, modelName의 소문자로 하고, 복수형으로 짓는다.
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
};