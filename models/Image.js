const mongoose = require('mongoose')
const {Schema} = mongoose

const imageSchema = Schema({
   imageUrl:{
      type: String,
      required: true
   }
})

module.exports = mongoose.model('Image', imageSchema)