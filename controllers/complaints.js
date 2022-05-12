const complaintsRouter = require('express').Router()
const User = require('../models/user')
const Complaint = require('../models/complaint')
const jwt = require('jsonwebtoken')
const multer = require('multer')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/')
    },
    filename: (req, file, cb) => {
        cb(null, new Date().toISOString() + '-' + file.originalname)
    }
})

const upload = multer({ storage: storage })

complaintsRouter.get('/:id', (request, response, next) => {
    Complaint.findById(request.params.id).then(complaint => {
        if (complaint) {
            response.json(complaint)
        } else {
            response.status(404).end()
        }
        
    })
        .catch(error => next(error))

})

complaintsRouter.get('/', async (request, response) => {
    const complaints = await Complaint
        .find({})
        .populate('user', { firstname: 1, lastname: 1, email: 1 }).populate('comments', {content:1, complaintId: 1, userId: 1})

    response.json(complaints)
  
})

complaintsRouter.delete('/:id', (request, response, next) => {
    Complaint.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

complaintsRouter.put('/:id', (request, response, next) => {
    const { content, important} = request.body

    //   const complaint = {
    //     content: body.content,
    //     important: body.important,
    //   }
    // add {new: true} to make sure update is done
    Complaint.findByIdAndUpdate(
        request.params.id, 
        { content, important },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedComplaint => {
            response.json(updatedComplaint)
        })
        .catch(error => next(error))
})

const getTokenFrom = request => {
    const authorization = request.get('authorization')
    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
        return authorization.substring(7)
    }
    return null
}

complaintsRouter.post('/', upload.single('image'), async (request, response) => {
    console.log(request.file)
    const body = request.body

    const token = getTokenFrom(request)
    const decodedToken = jwt.verify(token, process.env.SECRET)
    if (!decodedToken.id) {
        return response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    const complaint = new Complaint( {
        title: body.title,
        content: body.content,
        date: new Date(),
        user: user._id,
        image: request.file.path
    })

    const savedComplaint = await complaint.save()
    user.complaints = user.complaints.concat(savedComplaint._id)
    await user.save()
    
    response.json(savedComplaint)
})

module.exports = complaintsRouter