// @/models.js
const { sequelize } = require("../config/sequelize");
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const { Calendar } = require("./Calendar");

const Notifications = sequelize.define("Notifications", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    calendarId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Calendar',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdBy: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    createdDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updatedDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    }
});

Calendar.hasMany(Notifications, { foreignKey: 'calendarId' });
Notifications.belongsTo(Calendar, { foreignKey: 'calendarId' });

module.exports = { Notifications };