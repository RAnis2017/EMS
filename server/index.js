const config = require('./config')

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require("cors")
const server = app.listen(config.port, () => console.log(`Server started on port ${config.port}`));
const { socketConnection } = require('./config/socket-io');

app.use(cors())
app.use(bodyParser.json())
// use uploads folder for static files
app.use(express.static('uploads'))

socketConnection(server, app);

//Routes
app.use(require('./routes')); 


