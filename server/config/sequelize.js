const Sequelize = require("sequelize");
const config = require("./index");
const sequelize = new Sequelize(
    config.db.dbName,
    config.db.user,
    config.db.password,
    {
        host: "0.0.0.0",
        dialect: "sqlite",
        logging: console.log,
        dialectOptions: {
            multipleStatements: true
        },
        pool: {
            max: 5,
            min: 0,
            idle: 10000
        },
        // Data is stored in the file `database.sqlite` in the folder `db`.
        // Note that if you leave your app public, this database file will be copied if
        // someone forks your app. So don't use it to store sensitive information.
        storage: "../db/database.sqlite"
    }
);

function connection() {
    try {
        sequelize.authenticate().then(() => {
            console.log("Connection has been established successfully.");
        }
        ).catch(err => {
            console.error('Unable to connect to the database:', err);
        });

    } catch (error) {
        console.error("Unable to connect to the database:", error);
    }
}

connection();

module.exports = {
    sequelize,
};