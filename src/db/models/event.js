const Sequelize = require('sequelize');

module.exports = class Event extends Sequelize.Model {
    static init(sequelize) {
        return super.init({
            eventId: {
                type: Sequelize.BIGINT(20),
                allowNull: false,
                primaryKey: true,
                comment: '이벤트 아이디'
            },
            ordering: {
                type: Sequelize.INTEGER(11),
                allowNull: false,
                defaultValue: '0',
                comment: '상단고정'
            },
            eventName: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '제목'
            },
            adminId: {
                type: Sequelize.STRING(50),
                allowNull: false,
                defaultValue: '',
                comment: '관리자'
            }
        },{
            sequelize,
            timestamps: true, // createAt, updateAt 자동 생성
            underscored: false, // sequelize에서 _ 사용할지 말지 ex) createAt -> create_at
            paranoid: true, // deleteAt을 생성 (삭제한 날짜)
            modelName: 'Events', // modelName - javascript에서 쓰인다.
            tableName: 'events', // tableName - SQL에서 쓰이며, modelName의 소문자로 하고, 복수형으로 짓는다.
            charset: 'utf8',
            collate: 'utf8_general_ci',
        });
    }
};