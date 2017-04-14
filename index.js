const Koa = require('koa')
const logger = require('koa-logger')
const Router = require('koa-router')
const parse = require('co-body')
const app = new Koa()
const router = new Router()
const cors = require('koa-cors')

const Promise = require('bluebird')
const jsonwebtoken = require('jsonwebtoken')
const jwtSecret = process.env.SECRET_KEY || 'random-secret'

const Sequelize = require('sequelize')
const dbUri = process.env.DB_URI
const conStr = dbUri || 'postgres://khluvvlp:--_C4pw8-ISV1Rdwnym96qgT8F6PXL8P@horton.elephantsql.com:5432/khluvvlp'

const sequelize = new Sequelize(conStr)
const bcrypt = require('bcryptjs')

function signAsync (data, secret) {
  return new Promise(function (resolve, reject) {
    jsonwebtoken.sign(data, secret, {}, function (err, token) {
      if (err) return reject(err)
      return resolve(token)
    })
  })
}

sequelize.User = sequelize.import('./models/User.js')
sequelize.Book = sequelize.import('./models/Book.js')

app.use(logger())
app.use(cors({
  origin: '*'
}))

router.post('/api/register', register)
router.post('/api/login', login)
router.post('/api/addbook', addBook)

app
.use(router.routes())
.use(router.allowedMethods())

async function addBook (ctx) {
  try {
    let body = await parse(ctx)
    if (!body) {
      ctx.throw(400, 'You need to fill out the form!')
    }
    if (!body.title) {
      ctx.throw(400, 'You need to input a title!')
    }
    if (!body.author) {
      body.author = 'unknown'
    }
    if (!body.priority) {
      body.priority = 'Medium'
    }
    let book = await sequelize.Book.create(body)
    ctx.response.body = book
  } catch (e) {
    throw e
  }
}

async function changePriority (ctx, bookTitle, priority) {
  try {
    let title = sequelize.Book.findOne({where: sequelize.Book.title === bookTitle})
    title.priority = priority
  } catch (e) {
    throw e
  }
}

async function register (ctx) {
  try {
    let body = await parse(ctx)
    if (!body) {
      ctx.throw(400, 'You need to fill out the form!')
    }
    if (!body.username) {
      ctx.throw(400, 'You need to input a username!')
    }
    let existingUser = await sequelize.User.findOne({
      where: {username: body.username}
    })
    if (existingUser) {
      ctx.throw(400, 'Username must be unique!')
    }
    if (!body.password) {
      ctx.throw(400, 'You must type in a password!')
    }
    if (body.password.length < 7) {
      ctx.throw(400, 'Your password is too short!')
    } else {
      let user = await sequelize.User.create(body)
      ctx.response.body = user
      console.log(body)
    }
  } catch (e) {
    if (e instanceof Sequelize.ValidationError) {
      this.status = 400
      this.body = {validationErrors: e.errors}
      return
    } else {
      throw e
    }
  }
}

async function login (ctx) {
  try {
    let body = await parse(ctx)
    if (!body) {
      ctx.throw(400, 'Please fill out the form!')
    }
    if (!body.username) {
      ctx.throw(400, 'You need to input a username!')
    }
    if (!body.password) {
      ctx.throw(400, 'You need to input a password!')
    }
    let user = await sequelize.User.findOne({
      where: {
        username: body.username
      }
    })
    if (!user) ctx.throw(400, 'User not found')
    let compare = await bcrypt.compare(body.password, user.password)
    if (compare) {
      let token = await signAsync({user: user.id}, jwtSecret)
      ctx.response.body = token
      return
    } else {
      ctx.throw(400, 'Invalid password')
    }
  } catch (e) {
    throw e
  }
}

const port = process.env.PORT || 3000
console.log('Initing db...')
sequelize.sync({force: true}).then(() => {
  app.listen(port)
  console.log('Listening on port ', port)
})
