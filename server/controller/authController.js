const bcrypt = require('bcryptjs')

module.exports = {
    register: async (req, res) => {
        const {username, password, isAdmin} = req.body
        const db = req.app.get('db')
        let user = await db.get_user(username)
        if(user[0]){
            return res.status(409).send('Username taken')
        }
        let salt = bcrypt.genSaltSync(10)
        let hash = bcrypt.hashSync(password, salt)
        let registeredUser = await db.register_user(isAdmin, username, hash)
        req.session.user = {isAdmin: registeredUser[0].is_admin, id: registeredUser[0].id, username: registeredUser[0].username}
        return res.status(201).send(req.session.user)
    },
    login: async(req,res) => {
        const {username, password} = req.body
        // console.log(req.body)
        const db = req.app.get('db')
        let foundUser = await db.get_user(username)
        let user = foundUser[0]
        // console.log(user)
        if(!user){
            return res.status(401).send('User not found. Please register as a new user before logging in.')
        }
        const isAuthenticated = bcrypt.compareSync(password, user.hash)
        if(!isAuthenticated){
            return res.status(403).send('Incorrect Password')
       }
       req.session.user = {isAdmin: user.is_admin, id: user.id, username: user.username}
    //    console.log(req.session.user)
        return res.status(201).send(req.session.user)
    },
    logout: (req, res) => {
        req.session.destroy()
        res.sendStatus(200)
    }
}