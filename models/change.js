const mongoose = require('mongoose')

const changeShcema = new mongoose.Schema({
  address: { type: String, unique: true },
  from: { type: Number },
  to: { type: Number },
  totalWeight: { type: Number },
  timestamp: { type: Number },
  productRecords: [
    {
      shipmentID: { type: Number },
      weight: { type: Number },
      timestamp: { type: Number },
    },
  ],
})

module.exports = mongoose.model('change', changeShcema)
