const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
    const { firstname, lastname, email, password } = request.body

    const existingUser = await User.findOne({ email })
    if (existingUser) {
        // how to log this msg to backend terminal or browser console? 
        return response.status(400).json({
            error: 'email must be unique'
        })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        firstname,
        lastname,
        email,
        passwordHash,
    })

    const savedUser = await user.save()

    response.status(201).json(savedUser)
})


usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('complaints', {content: 1, date: 1})
    console.log('users', users)
    
    response.json(users)
})

module.exports = usersRouter