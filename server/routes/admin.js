require('dotenv').config()
var express = require('express');
var router = express.Router();
const Technologies = require('../models/Technologies').Technologies;
const Skills = require('../models/Skills').Skills;
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, 'uploads')
    },
    filename: (req, file, callBack) => {
        callBack(null, `${file.originalname}`)
    }
})
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
        createdBy: req.user.email
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
        updatedBy: req.user.email
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
        createdBy: req.user.email
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

    Skills.update({
        name: req.body.name,
        technology: req.body.technology,
        status: req.body.status,
        updatedBy: req.user.email
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

module.exports = router;
