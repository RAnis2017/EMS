// @/models.js
const { sequelize } = require("../config/sequelize");
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");
const { Users } = require("./Users");

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
        unique: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    technology: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false
    },
    skills: {
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        allowNull: false
    },
    manager: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
            key: 'id'
        }
    },
    sporting_manager: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Users',
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

// create a one-to-many relationship between Employees and Users
Employees.belongsTo(Users, { foreignKey: 'manager', as: 'manager_obj' });
Employees.belongsTo(Users, { foreignKey: 'sporting_manager', as: 'sporting_manager_obj' });

module.exports = { Employees };