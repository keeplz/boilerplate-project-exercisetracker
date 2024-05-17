const express = require('express')
const app = express()
const cors = require('cors')
const md5 = require('crypto-js/md5')
const bodyParser = require('body-parser')

require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: false}))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// get username by users -- id
const users = new Map() 
// get logs by logs -- id
const logs = new Map()

// init
users.set('555', 'test')


app.post('/api/users', function(req, res) {
  const name = req.body.username
  const id = md5(name).toString()
  users.set(id, name)
  res.json({
    _id: id,
    username: name
  })
})
app.get('/api/users', function(req, res) {
  const result = []

  users.forEach((name, id) => {
    result.push({
      _id: id,
      username: name
    })
  })
  res.json(result)
})


const logInToLogs = (id, log) => {
  const userName = users.get(id)
  if (!logs.has(id)) {
    logs.set(id, {
      username: userName,
      count: 0,
      _id: id,
      log: []
    })
  }

  const curUser = logs.get(id)
  const curLog = curUser.log
  curUser.count += 1
  curLog.unshift(log)

}

app.post('/api/users/:_id/exercises', function(req, res) {
  const id = req.params._id

  if (!users.has(id)) {
    return res.json({
      error: '没有这个用户'
    })
  }


  let {description, duration, date} = req.body


  const log = {
    description,
    duration: Number(duration),
    date: date ? new Date(date).toDateString() : new Date().toDateString()
  }

  const userName = users.get(id)
  const resObj = Object.assign({}, log, {
    username: userName,
    _id: id
  })

  logInToLogs(id, log)


  

  res.json(resObj)
})


app.get('/api/users/:_id/logs', function(req, res) {
  const id = req.params._id

  if (!users.has(id)) {
    res.json({
      msg: '没有这个用户'
    })
    return
  }

  const record = structuredClone(logs.get(id))

  const from = req.query.from
  const to = req.query.to
  const limit = req.query.limit
  // from to

  if (from && to) {
    const fromStamp = new Date(from).getTime()
    const toStamp = new Date(to).getTime()
  
    record.log = record.log.filter(item => {
      const curTime = new Date(item.date).getTime()
  
      return curTime >= fromStamp && curTime <= toStamp
    })
  }
  
  // limit
  if (limit !== undefined) {
    record.log = record.log.slice(0, limit)
  }

  res.json(record)
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
