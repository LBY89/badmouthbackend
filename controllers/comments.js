const commentsRouter = require('express').Router()

const Comment = require('../models/comment')
const Complaint = require('../models/complaint')


commentsRouter.get('/:id', (request, response, next) => {
    Comment.findById(request.params.id).then(comment => {
        if (comment) {
            response.json(comment)
        } else {
            response.status(404).end()
        }
        
    })
        .catch(error => next(error))

})

commentsRouter.get('/', (request, response) => {
    Comment.find({}).then(comments => {
        response.json(comments)
    })
  
})

commentsRouter.delete('/:id', (request, response, next) => {
    Comment.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

commentsRouter.put('/:id', (request, response, next) => {
    const { content, important} = request.body

    Comment.findByIdAndUpdate(
        request.params.id, 
        { content, important },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedcomment => {
            response.json(updatedcomment)
        })
        .catch(error => next(error))
})

commentsRouter.post('/', async (request, response, next) => {
    const body = request.body
    const id = body.complaintId
    const complaint = await Complaint.findById(id)

    const comment = new Comment( {
        content: body.content,
        date: new Date(),
        complaintId: body.complaintId,
        userId: body.userId
    })
    
    const savedComment = await comment.save()
    complaint.comments = complaint.comments.concat(savedComment)    
    await complaint.save()
    response.json(savedComment)

})

module.exports = commentsRouter