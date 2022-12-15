// @/models.js
const { sequelize } = require("../config/sequelize");
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const { Employees } = require("./Employees");

const Reviews = sequelize.define("Reviews", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    developer: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Employees',
            key: 'id'
        }
    },
    text: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    rating: {
        type: DataTypes.INTEGER,
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

Reviews.belongsTo(Employees, { foreignKey: 'developer' });

module.exports = { Reviews };