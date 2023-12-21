const mongoose = require('mongoose')

const contactShcema = new mongoose.Schema({
  name: { type: String },
  address: { type: String, unique: true },
  occupation: { type: String },
  location: { type: String },
})

module.exports = mongoose.model('contact', contactShcema)
