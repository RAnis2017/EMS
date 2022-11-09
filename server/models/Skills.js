// @/models.js
const { sequelize } = require("../config/sequelize");
const { DataTypes } = require("sequelize");
const Sequelize = require("sequelize");

const Skills = sequelize.define("Skills", {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    technology: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'Technologies',
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

module.exports = { Skills };