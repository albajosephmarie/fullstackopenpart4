const config = require('./utils/config')
const express = require('express')
require('express-async-errors')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const app = express()
const cors = require('cors')
const logger = require('./utils/logger')
const blogRouter = require('./controllers/blogs')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB:', error.message)
  })

  organ.token('body', function (req) { return JSON.stringify(req.body) })

  app.use(bodyParser.json())
  app.use(cors())
  app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
  
  app.use('/api/login', loginRouter)
  app.use('/api/users', usersRouter)
  
  app.use(middleware.tokenExtractor)
  app.use(middleware.tokenValidator)
  
  app.use('/api/blogs', blogRouter)
  
  app.use(middleware.errorHandler)
  
  module.exports = app