const mongoose = require('mongoose')

const contactShcema = new mongoose.Schema({
  account: { type: String, unique: true },
  contact: [
    {
      name: { type: String },
      address: { type: String },
      occupation: { type: String },
      location: { type: String },
    },
  ],
})

module.exports = mongoose.model('contact', contactShcema)
