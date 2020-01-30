require('dotenv').config()
const express = require('express'),
      session = require('express-session'),
      massive = require('massive'),
      {SERVER_PORT, SESSION_SECRET, CONNECTION_STRING} = process.env,
      authCtrl = require('./controller/authController'),
      treasureCtrl = require('./controller/treasureController'),
      auth = require('./middleware/authMiddleware'),
      app = express()

app.use(express.json())

app.use(session({
    resave: false,
    secret: SESSION_SECRET,
    cookie: {maxAge: 3600000},
    saveUninitialized: true
}))

//auth controllers
app.post('/auth/register', authCtrl.register)
app.post('/auth/login', authCtrl.login)
app.get('/auth/logout', authCtrl.logout)

//treasure controllers
app.get('/api/treasure/dragon', treasureCtrl.dragonTreasure)
app.get('/api/treasure/user', auth.usersOnly, treasureCtrl.getUserTreasure)
app.post('/api/treasure/user', auth.usersOnly, treasureCtrl.addUserTreasure)
app.get('/api/treasure/all', auth.usersOnly, auth.adminsOnly, treasureCtrl.getAllTreasure)

massive(CONNECTION_STRING).then(db => {
    app.set('db', db);
    console.log('db connected');
    app.listen(SERVER_PORT, () => console.log(`Server running on ${SERVER_PORT}`));
})