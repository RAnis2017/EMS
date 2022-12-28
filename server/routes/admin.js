require('dotenv').config()
var express = require('express');
var router = express.Router();
const bcrypt = require('bcrypt');
const Technologies = require('../models/Technologies').Technologies;
const Skills = require('../models/Skills').Skills;
const Employees = require('../models/Employees').Employees;
const Users = require('../models/Users').Users;
const multer = require('multer');
const { Reviews } = require('../models/Reviews');
const { Op, Sequelize } = require('sequelize');
const { Calendar } = require('../models/Calendar');
const { Notifications } = require('../models/Notifications');
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
})
const moment = require('moment');
const { sequelize } = require('../config/sequelize');
// const nodemailer = require('nodemailer');

// let transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//         type: 'OAuth2',
//         user: process.env.MAIL_USERNAME,
//         pass: process.env.MAIL_PASSWORD,
//         clientId: process.env.OAUTH_CLIENTID,
//         clientSecret: process.env.OAUTH_CLIENT_SECRET,
//         refreshToken: process.env.OAUTH_REFRESH_TOKEN
//     }
// });
// let mailOptions = {
//     from: 'admin@cms.com',
//     to: 'razaanis123@gmail.com',
//     subject: 'Zepcom CMS App',
//     text: ''
// };

const multi_upload = multer({
    dest: 'uploads/',
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 1MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    },
}).array('images', 10)

const single_upload = multer({
    dest: 'uploads/',
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 1MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg") {
            cb(null, true);
        } else {
            cb(null, false);
            const err = new Error('Only .png, .jpg and .jpeg format allowed!')
            err.name = 'ExtensionError'
            return cb(err);
        }
    },
}).single('image')

router.get('/get-technologies', async (req, res, next) => {

    await Technologies.sync();

    Technologies.findAll({}).then((technologies) => {
        if (!technologies) {
            res.status(400).json({ error: 'Technologies not found' });
        } else {
            let data = [];
            technologies.forEach((technology) => {
                data.push({
                    key: technology.id,
                    name: technology.name,
                    status: technology.status[0].toUpperCase() + technology.status.slice(1),
                    createdBy: technology.createdBy,
                    createdDate: new Date(technology.createdAt).toLocaleDateString(),
                })
            })

            res.status(200).json({ data });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.post('/add-technology', async (req, res, next) => {

    await Technologies.sync();

    Technologies.create({
        name: req.body.name,
        status: req.body.status,
        createdBy: req.user.alias
    }).then((technology) => {
        if (!technology) {
            res.status(400).json({ error: 'Technology not created' });
        } else {
            res.status(200).json({ message: 'Technology created successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.put('/update-technology/:id', async (req, res, next) => {

    await Technologies.sync();

    Technologies.update({
        name: req.body.name,
        status: req.body.status,
        updatedBy: req.user.alias
    }, {
        where: {
            id: req.params.id
        }
    }).then((technology) => {
        if (!technology) {
            res.status(400).json({ error: 'Technology not updated' });
        } else {
            res.status(200).json({ message: 'Technology updated successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.delete('/delete-technology/:id', async (req, res, next) => {

    await Technologies.sync();

    Technologies.destroy({
        where: {
            id: req.params.id
        }
    }).then((technology) => {
        if (!technology) {
            res.status(400).json({ error: 'Technology not deleted' });
        } else {
            res.status(200).json({ message: 'Technology deleted successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.get('/get-skills', async (req, res, next) => {

    await Skills.sync();
    await Technologies.sync();

    Skills.belongsTo(Technologies, { foreignKey: 'technology', targetKey: 'id' });
    Technologies.hasMany(Skills, { foreignKey: 'technology', sourceKey: 'id' });

    Skills.findAll({
        include: [{
            model: Technologies
        }]
    }).then((skills) => {
        if (!skills) {
            res.status(400).json({ error: 'Skills not found' });
        } else {
            let data = [];
            skills.forEach((skill) => {
                data.push({
                    key: skill.id,
                    name: skill.name,
                    technology: skill.Technology ? skill.Technology.name : skill.technology,
                    technologyId: skill.technology,
                    status: skill.status[0].toUpperCase() + skill.status.slice(1),
                    createdBy: skill.createdBy,
                    createdDate: new Date(skill.createdAt).toLocaleDateString(),
                })
            })

            res.status(200).json({ data });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.post('/add-skill', async (req, res, next) => {

    await Skills.sync();

    Skills.create({
        name: req.body.name,
        technology: req.body.technology,
        status: req.body.status,
        createdBy: req.user.alias
    }).then((skill) => {
        if (!skill) {
            res.status(400).json({ error: 'Skill not created' });
        } else {
            res.status(200).json({ message: 'Skill created successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.put('/update-skill/:id', async (req, res, next) => {

    await Skills.sync();

    let technologyId = !isNaN(req.body.technology) ? req.body.technology : parseInt(req.body.technologyId);

    Skills.update({
        name: req.body.name,
        technology: technologyId,
        status: req.body.status,
        updatedBy: req.user.alias
    }, {
        where: {
            id: req.params.id
        }
    }).then((skill) => {
        if (!skill) {
            res.status(400).json({ error: 'Skill not updated' });
        } else {
            res.status(200).json({ message: 'Skill updated successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.delete('/delete-skill/:id', async (req, res, next) => {

    await Skills.sync();

    Skills.destroy({
        where: {
            id: req.params.id
        }
    }).then((skill) => {
        if (!skill) {
            res.status(400).json({ error: 'Skill not deleted' });
        } else {
            res.status(200).json({ message: 'Skill deleted successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.get('/get-technologies-skills', async (req, res, next) => {
    await Technologies.sync();
    await Skills.sync();

    Technologies.hasMany(Skills, { foreignKey: 'technology', sourceKey: 'id' });
    Skills.belongsTo(Technologies, { foreignKey: 'technology', targetKey: 'id' });

    Technologies.findAll({
        include: [{
            model: Skills
        }]
    }).then((technologies) => {

        if (!technologies) {
            res.status(400).json({ error: 'Technologies not found' });
        } else {
            let data = [];
            technologies.forEach((technology) => {
                data.push({
                    key: technology.id,
                    name: technology.name,
                    skills: technology.Skills,
                    status: technology.status[0].toUpperCase() + technology.status.slice(1),
                    createdBy: technology.createdBy,
                    createdDate: new Date(technology.createdAt).toLocaleDateString(),
                })
            })

            res.status(200).json({ data });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.get('/get-employees', async (req, res, next) => {

    await Employees.sync({
        force: false
    });

    Employees.findAll({
        include: [{
            model: Users,
            as: 'manager_obj',
        }, {
            model: Users,
            as: 'sporting_manager_obj',
        }]
    }).then((employees) => {
        if (!employees) {
            res.status(400).json({ error: 'Employees not found' });
        } else {
            let data = [];
            employees.forEach((employee) => {
                data.push({
                    key: employee.id,
                    alias: employee.emp_alias,
                    email: employee.email,
                    skills: employee.skills,
                    technology: employee.technology,
                    manager: employee.manager,
                    sporting_manager: employee.sporting_manager,
                    manager_name: employee.manager_obj.alias,
                    sporting_manager_name: employee.sporting_manager_obj.alias,
                    status: employee.status[0].toUpperCase() + employee.status.slice(1),
                    createdBy: employee.createdBy,
                    createdDate: new Date(employee.createdAt).toLocaleDateString(),
                })
            })

            res.status(200).json({ data });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.post('/add-employee', async (req, res, next) => {

    await Employees.sync();

    Employees.create({
        emp_alias: req.body.alias,
        email: req.body.email,
        skills: req.body.skills,
        technology: req.body.technology,
        manager: req.body.manager,
        sporting_manager: req.body.sporting_manager,
        status: req.body.status,
        createdBy: req.user.alias
    }).then((employee) => {
        if (!employee) {
            res.status(400).json({ error: 'Employee not created' });
        } else {
            res.status(200).json({ message: 'Employee created successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.put('/update-employee/:id', async (req, res, next) => {
    
    await Employees.sync();

    Employees.update({
        emp_alias: req.body.alias,
        email: req.body.email,
        skills: req.body.skills?.length && req.body.skills.indexOf(',') > -1 ? req.body.skills.split(',') : [`${req.body.skills}`],
        technology: req.body.technology,
        manager: req.body.manager,
        sporting_manager: req.body.sporting_manager,
        status: req.body.status,
        updatedBy: req.user.alias
    }, {
        where: {
            id: req.params.id
        }
    }).then((employee) => {
        if (!employee) {
            res.status(400).json({ error: 'Employee not updated' });
        } else {
            res.status(200).json({ message: 'Employee updated successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.delete('/delete-employee/:id', async (req, res, next) => {
    
    await Employees.sync();

    Employees.destroy({
        where: {
            id: req.params.id
        }
    }).then((employee) => {
        if (!employee) {
            res.status(400).json({ error: 'Employee not deleted' });
        } else {
            res.status(200).json({ message: 'Employee deleted successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})


router.get('/get-users', async (req, res, next) => {

    await Users.sync();
    Users.findAll({
        attributes: { 
            include: [[Sequelize.fn('COUNT', Sequelize.col('manager_obj.id')), 'manager_count'], [Sequelize.fn('COUNT', Sequelize.col('sporting_manager_obj.id')), 'sporting_manager_count']] 
        },
        include: [{
            model: Employees,
            as: 'manager_obj',
        }, {
            model: Employees,
            as: 'sporting_manager_obj',
        }],
        group: ['Users.id']
    }).then((users) => {
        if (!users) {
            res.status(400).json({ error: 'Users not found' });
        } else {
            let data = [];
            users.forEach((user) => {
                data.push({
                    key: user.id,
                    alias: user.alias,
                    email: user.email,
                    username: user.username,
                    name: user.name,
                    password: '********',
                    developers: user.dataValues.manager_count + user.dataValues.sporting_manager_count,
                    isAdmin: user.isAdmin,
                    status: user.status[0].toUpperCase() + user.status.slice(1),
                    createdBy: user.created_by,
                    createdDate: new Date(user.created_date).toLocaleDateString(),
                })
            })

            res.status(200).json({ data });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.post('/add-user', async (req, res, next) => {

    await Users.sync();

    // password encryption
    let hash = bcrypt.hashSync(req.body.password, 12);

    Users.create({
        alias: req.body.alias,
        email: req.body.email,
        username: req.body.username,
        password: hash,
        name: req.body.name,
        isAdmin: req.body.isAdmin,
        status: req.body.status,
        created_by: req.user.alias
    }).then((user) => {
        if (!user) {
            res.status(400).json({ error: 'User not created' });
        } else {
            res.status(200).json({ message: 'User created successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.put('/update-user/:id', async (req, res, next) => {
    
    await Users.sync();

    // password encryption
    let hash = bcrypt.hashSync(req.body.password, 12);

    let updateObj = {
        alias: req.body.alias,
        email: req.body.email,
        username: req.body.username,
        name: req.body.name,
        isAdmin: req.body.isAdmin,
        status: req.body.status,
        updated_by: req.user.alias
    }

    if (req.body.password) {
        updateObj.password = hash;
    }

    Users.update(updateObj, {
        where: {
            id: req.params.id
        }
    }).then((user) => {
        if (!user) {
            res.status(400).json({ error: 'User not updated' });
        } else {
            res.status(200).json({ message: 'User updated successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.delete('/delete-user/:id', async (req, res, next) => {
    
    await Users.sync();

    Users.destroy({
        where: {
            id: req.params.id
        }
    }).then((user) => {
        if (!user) {
            res.status(400).json({ error: 'User not deleted' });
        } else {
            res.status(200).json({ message: 'User deleted successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.get('/get-reviews', async (req, res, next) => {

    await Reviews.sync();

    // get user id from alias
    let user = await Users.findOne({
        where: {
            alias: req.user.alias
        }
    });

    let findAllQuery = {
        include: [{
            model: Employees,
            include: [{
                model: Users,
                as: 'manager_obj',
            }, {
                model: Users,
                as: 'sporting_manager_obj',
            }]
        }],
        order: [
            ['createdDate', 'DESC']
        ],
    }

    if(req.user.isAdmin == false) {
        findAllQuery.where = {
            [Op.or]: [
                { '$Employee.manager_obj.id$': user.id },
                { '$Employee.sporting_manager_obj.id$': user.id }
            ]
        }
    }

    Reviews.findAll(findAllQuery).then((reviews) => {
        if (!reviews) {
            res.status(400).json({ error: 'Reviews not found' });
        } else {
            let data = [];
            reviews.forEach((review) => {
                data.push({
                    key: review.id,
                    developer: review.Employee.emp_alias,
                    manager: review.Employee.manager_obj.alias,
                    sporting_manager: review.Employee.sporting_manager_obj.alias,
                    text: review.text,
                    rating: review.rating,
                    createdBy: review.createdBy,
                    createdDate: new Date(review.createdDate).toLocaleDateString(),
                })
            })

            res.status(200).json({ data });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.post('/add-review', async (req, res, next) => {

    await Reviews.sync();

    Reviews.create({
        developer: req.body.developer,
        text: req.body.text,
        rating: req.body.rating,
        createdDate: req.body.createdDate,
        createdBy: req.user.alias
    }).then((review) => {
        if (!review) {
            res.status(400).json({ error: 'Review not created' });
        } else {
            res.status(200).json({ message: 'Review created successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.put('/update-review/:id', async (req, res, next) => {
    
    await Reviews.sync();

    Reviews.update({
        developer: req.body.developer,
        text: req.body.text,
        rating: req.body.rating,
        createdDate: req.body.createdDate,
        updatedBy: req.user.alias
    }, {
        where: {
            id: req.params.id
        }
    }).then((review) => {
        if (!review) {
            res.status(400).json({ error: 'Review not updated' });
        } else {
            res.status(200).json({ message: 'Review updated successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.delete('/delete-review/:id', async (req, res, next) => {
    
    await Reviews.sync();

    Reviews.destroy({
        where: {
            id: req.params.id
        }
    }).then((review) => {
        if (!review) {
            res.status(400).json({ error: 'Review not deleted' });
        } else {
            res.status(200).json({ message: 'Review deleted successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.get('/get-calendars', async (req, res, next) => {

    await Calendar.sync();
    await Notifications.sync();

    let queryParam = req.query.current;

    let query = {
        include: [{
            model: Employees,
            include: [{
                model: Users,
                as: 'manager_obj'
            }, {
                model: Users,
                as: 'sporting_manager_obj'
            }]
        }, {
            model: Notifications,
        }]
    }

    let date = new Date();
    // formate date to yyyy-mm-dd
    let formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    
    if(queryParam == '1') {
        query.where = {
            date: formattedDate,
            [Op.or]: [
                { '$Employee.manager_obj.alias$': req.user.alias },
                { '$Employee.sporting_manager_obj.alias$': req.user.alias }
            ]
        }

        query.order = [
            ['startTime', 'ASC']
        ]
    }

    Calendar.findAll(query).then((calendars) => {
        if (!calendars) {
            res.status(400).json({ error: 'Calendars not found' });
        } else {
            let data = [];
            calendars.forEach((calendar) => {
                data.push({
                    key: calendar.id,
                    developer: calendar.Employee.id,
                    developerName: calendar.Employee.emp_alias,
                    manager: calendar.Employee.manager_obj.alias,
                    sportingManager: calendar.Employee.sporting_manager_obj.alias,
                    date: moment(calendar.date).format('DD/MM/YYYY'),
                    endDate: moment(calendar.date).format('DD/MM/YYYY'),
                    startTime: calendar.startTime,
                    endTime: calendar.endTime,
                    createdBy: calendar.createdBy,
                    createdDate: new Date(calendar.createdAt).toLocaleDateString(),
                })
            })

            res.status(200).json({ data });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.post('/add-calendar', async (req, res, next) => {

    await Calendar.sync();

    let startTime = new Date(req.body.startTime);
    let endTime = startTime;
    endTime.setMinutes(endTime.getMinutes() + 60);

    // end time to string with format YYYY-MM-DDTHH:mm:ss.sssZ
    endTime = endTime.toISOString();

    let date = moment(req.body.date).subtract(5, 'hours');
    let endDate = moment(req.body.endDate).subtract(5, 'hours');
    
    // search calendars for existing event between start and end time

    let calendars = await Calendar.findAll({
        where: {
            startTime: {
                [Op.lte]: endTime
            },
            endTime: {
                [Op.gte]: req.body.startTime
            }
        }
    });

    // filter calendars if date is between start and end date
    calendars = calendars.filter((calendar) => {
        let calendarDate = moment(calendar.date);
        if(calendarDate >= date && calendarDate <= endDate) {
            return calendar;
        }
    })

    if (calendars.length > 0) {
        res.status(400).json({ error: 'Calendar event already exists' });
        return;
    }

    // create bulk calendars for each 7 days between start and end date

    let bulkCalendars = [];
    let currentDate = date;
    while(currentDate <= endDate) {
        bulkCalendars.push({
            developer: req.body.developer,
            date: currentDate.format('YYYY-MM-DD'),
            endDate: endDate._i,
            startTime: req.body.startTime,
            endTime,
            createdBy: req.user.alias
        })
        currentDate = currentDate.add(7, 'days');
    }

    // raw query to insert bulk calendars sql

    let query = '';
    if (bulkCalendars.length > 0) {
        query = `INSERT INTO calendars (developer, date, endDate, startTime, endTime, createdBy, createdAt, updatedAt) VALUES `;
    }
    bulkCalendars.forEach((calendar) => {
        query += `(${calendar.developer}, '${calendar.date}', '${calendar.endDate}', '${calendar.startTime}', '${calendar.endTime}', '${calendar.createdBy}', '${new Date().toISOString()}', '${new Date().toISOString()}'),`;
    })
    query = query.slice(0, -1);

    // insert bulk calendars
    if(query.trim() !== '') {
        await sequelize.query(query).then((result) => {
            if (result[1] == 0) {
                res.status(400).json({ error: 'Calendar not created' });
            } else {
                res.status(200).json({ message: 'Calendar created successfully' });
            }
        }).catch((err) => {
            res.status(400).json({ error: err });
        })
    } else {
        res.status(200).json({ message: 'Calendar created successfully' });
    }
})

router.put('/update-calendar/:id', async (req, res, next) => {
    
    let startTime = new Date(req.body.startTime);
    let endTime = startTime;
    endTime.setMinutes(endTime.getMinutes() + 60);

    // end time to string with format YYYY-MM-DDTHH:mm:ss.sssZ
    endTime = endTime.toISOString();

    let date = req.body.date.split('T')[0]; 
    
    // search calendars for existing event between start and end time
    let calendars = await Calendar.findAll({
        where: {
            date,
            startTime: {
                [Op.lte]: endTime
            },
            endTime: {
                [Op.gte]: req.body.startTime
            },
            id: {
                [Op.ne]: req.params.id
            }
        }
    });

    if (calendars.length > 0) {
        res.status(400).json({ error: 'Calendar event already exists' });
        return;
    }

    Calendar.update({
        developer: req.body.developer,
        date: req.body.date.split('T')[0],
        startTime: req.body.startTime,
        endTime,
        updatedBy: req.user.alias
    }, {
        where: {
            id: req.params.id
        }
    }).then((calendar) => {
        if (!calendar) {
            res.status(400).json({ error: 'Calendar not updated' });
        } else {
            res.status(200).json({ message: 'Calendar updated successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.delete('/delete-calendar/:id', async (req, res, next) => {
    
    await Calendar.sync();

    Calendar.destroy({
        where: {
            id: req.params.id
        }
    }).then((calendar) => {
        if (!calendar) {
            res.status(400).json({ error: 'Calendar not deleted' });
        } else {
            res.status(200).json({ message: 'Calendar deleted successfully' });
        }
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

router.get('/get-stats', async (req, res, next) => {

    await Employees.sync();
    await Reviews.sync();
    await Calendar.sync();
    await Users.sync();
    await Notifications.sync();

    let date = new Date();
    let formattedDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();

    // count of all developers
    let developers = await Employees.count();

    // count of all reviews
    // get user id from alias
    let user = await Users.findOne({
        where: {
            alias: req.user.alias
        }
    });
    
    // moment get start of today and now get range of a day 24 hours only
    let TODAY_START = moment().startOf('day').subtract('hours', 5).toDate();
    let NOW = moment().endOf('day').subtract('hours', 5).toDate();

    let findAllQuery = {
        include: [{
            model: Employees,
            include: [{
                model: Users,
                as: 'manager_obj',
            }, {
                model: Users,
                as: 'sporting_manager_obj',
            }]
        }],
        where: {
            createdDate: {
                [Op.gt]: TODAY_START,
                [Op.lt]: NOW
            },
            [Op.or]: [
                { '$Employee.manager_obj.id$': user.id },
                { '$Employee.sporting_manager_obj.id$': user.id }
            ]
        },
        order: [
            ['createdDate', 'DESC']
        ],
    }

    let reviews = await Reviews.count(findAllQuery);

    // count of all meetings only today's meetings 
    let meetings = await Calendar.count({
        include: [{
            model: Employees,
            include: [{
                model: Users,
                as: 'manager_obj'
            }, {
                model: Users,
                as: 'sporting_manager_obj'
            }]
        }],
        where: {
            date: formattedDate,
            [Op.or]: [
                { '$Employee.manager_obj.alias$': req.user.alias },
                { '$Employee.sporting_manager_obj.alias$': req.user.alias }
            ]
        },
        order: [
            ['startTime', 'ASC']
        ]
    });

    // count of all users
    let users = await Users.count();

    res.status(200).json({ developers, reviews, meetings, users });
})

router.post('/set-notifications', async (req, res, next) => {

    Notifications.sync();

    let calendarIds = req.body.calendarIds;

    // add bulk notifications for all calendar ids

    let notifications = [];

    for (let i = 0; i < calendarIds.length; i++) {
        notifications.push({
            calendarId: calendarIds[i],
            status: 'read',
            createdBy: req.user.alias
        });
    }

    // read all notifications for current user
    let userNotifications = await Notifications.findAll({
        where: {
            createdBy: req.user.alias
        }
    });
    

    // create bulk notifications using raw query

    let query = 'INSERT INTO Notifications (calendarId, status, createdBy, createdDate, updatedDate) VALUES ';

    for (let i = 0; i < notifications.length; i++) {
        query += '(' + notifications[i].calendarId + ', "' + notifications[i].status + '", "' + notifications[i].createdBy + '", NOW(), NOW())';
        if (i != notifications.length - 1) {
            query += ',';
        }
    }

    sequelize.query(query, { type: sequelize.QueryTypes.INSERT }).then((notifications) => {
        res.status(200).json({ message: 'Notifications set successfully' });
    }).catch((err) => {
        res.status(400).json({ error: err });
    })
})

module.exports = router;
