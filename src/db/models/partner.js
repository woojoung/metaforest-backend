const Sequelize = require('sequelize');

module.exports = class Partner extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            partnerId: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                comment: '기관 번호'
            },
            partnerNickname: {
                type: Sequelize.STRING(45),
                allowNull: false,
                defaultValue: '',
                comment: '기관 이름'
            },
            code: {
                type: Sequelize.STRING(45),
                allowNull: false,
                defaultValue: '',
                comment: '기관 코드'
            },
            plan: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: '0',
                comment: '플랜'
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
            modelName: 'Partners', // modelName - javascript에서 쓰인다.
            tableName: 'partners', // tableName - SQL에서 쓰이며, modelName의 소문자로 하고, 복수형으로 짓는다.
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
};