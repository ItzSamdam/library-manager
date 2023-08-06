const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const logger = require( "./config/logger");

const userRoute = require('./routes/user.route')
const adminRoute = require('./routes/admin.route')

const app = express()
require('dotenv').config()


app.use(cors())
app.use(express.urlencoded({extended: true}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))


app.listen(process.env.PORT || 4000, async (req, res) => {
    logger.info(`===================================================================================================`);
    logger.info(`=================================== 🚀 SERVER ENV: ${process.env.ENV} ======================================`);
    logger.info(`=================================== 🚀 App listening on port ${process.env.PORT || 4000} ====================================`);
    logger.info(`====================================================================================================`);
})

app.get('/', (req, res) => {
    return res.json({
        message: 'library server is running'
    })
})
app.use('/api/user', userRoute)
app.use('/api/admin', adminRoute)
app.use('/uploads', express.static('uploads'));
app.use('*', (req, res) => {
    return res.status(404).send('Route not found')
})