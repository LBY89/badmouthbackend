const commentsRouter = require('express').Router()

const comment = require('../models/comment')


commentsRouter.get('/:id', (request, response, next) => {
    comment.findById(request.params.id).then(comment => {
        if (comment) {
            response.json(comment)
        } else {
            response.status(404).end()
        }
        
    })
        .catch(error => next(error))

})

commentsRouter.get('/', (request, response) => {
    comment.find({}).then(comments => {
        response.json(comments)
    })
  
})

commentsRouter.delete('/:id', (request, response, next) => {
    comment.findByIdAndRemove(request.params.id)
        .then(result => {
            response.status(204).end()
        })
        .catch(error => next(error))
})

commentsRouter.put('/:id', (request, response, next) => {
    const { content, important} = request.body

    //   const comment = {
    //     content: body.content,
    //     important: body.important,
    //   }
    // add {new: true} to make sure update is done
    comment.findByIdAndUpdate(
        request.params.id, 
        { content, important },
        { new: true, runValidators: true, context: 'query' }
    )
        .then(updatedcomment => {
            response.json(updatedcomment)
        })
        .catch(error => next(error))
})


commentsRouter.post('/', (request, response, next) => {
    const body = request.body

    const comment = new comment( {
        content: body.content,
        important: body.important || false,
        date: new Date(),
    })

    comment.save().then(savedcomment => {
        response.json(savedcomment)
    })
        .catch(error => next(error))

})

module.exports = commentsRouter