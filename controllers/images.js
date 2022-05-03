const imageRouter = require('express').Router()
const User = require('../models/user')

const jwt = require('jsonwebtoken')

const multer = require('multer')



const Image = require('../models/image')

const fs = require('fs')
const path = require('path')

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

const upload = multer({ storage: storage })

imageRouter.get('/', (req, res) => {
    Image.find({}, (err, items) => {
        if (err) {
            console.log(err)
            res.status(500).send('An error occurred', err)
        }
        else {
            res.render('imagesPage', { items: items })
        }
    })
})

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

imageRouter.post('/', upload.single('image'), async (req, res, next) => {
    const body = req.body

    const token = getTokenFrom(req)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
        return res.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

	const image = new Image ({
		name: req.body.name,
		desc: req.body.desc,
		img: {
			data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
			contentType: 'image/png'
		},
        user: user._id
	})

    const savedImage = await image.save()
    user.images = user.images.concat(savedImage._id)
    await user.save()
    res.json(savedImage)
	
})


module.exports = imageRouter