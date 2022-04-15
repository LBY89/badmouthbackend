const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]
//mongodb+srv://BaoyingLiu:xAVkTdRJQ9Zm5-L@cluster0.xcnc1.mongodb.net/testBadMouthDatabase?retryWrites=true&w=majority

const url =
  `mongodb+srv://BaoyingLiu:${password}@cluster0.xcnc1.mongodb.net/badMouthDatabase?retryWrites=true&w=majority`
// const url =
//   `mongodb+srv://fullstack:${password}@cluster0.o1opl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`

mongoose.connect(url)

const complaintSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Complaint = mongoose.model('complaint', complaintSchema)

const complaint = new Complaint({
  content: 'whats in result of complaint.save()',
  date: new Date(),
  important: true,
})

complaint.save().then(result => {
  console.log('result', result);
    
  console.log('complaint saved!')
  mongoose.connection.close()
})

// Complaint.find({}).then(result => {
//   result.forEach(complaint => {
//     console.log(complaint)
//   })
//   mongoose.connection.close()
// })