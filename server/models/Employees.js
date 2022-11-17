// @/models.js
const { sequelize } = require("../config/sequelize");
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");

const Employees = sequelize.define("Employees", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    emp_alias: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    technology: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Technologies',
            key: 'id'
        }
    },
    skills: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false
    },
    manager: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    sporting_manager: {
        type: DataTypes.STRING,
        allowNull: false,
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

module.exports = { Employees };