const config = require('./utils/config')
const express = require('express')
const app = express()
const cors = require('cors')
const complaintsRouter = require('./controllers/complaints')
const commentsRouter = require('./controllers/comments')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const fallback = require('express-history-api-fallback')
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
    .then(() => {
        logger.info('connected to MongoDB')
    })
    .catch((error) => {
        logger.error('error connecting to MongoDB:', error.message)
    })


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)



app.use('/api/uploads', express.static('uploads'), complaintsRouter)
app.use('/api/complaints', complaintsRouter)
app.use('/api/complaints/:id/comments', commentsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(fallback('index.html',{root: 'build'}))

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app