const mongoose = require('mongoose')
const {Schema} = mongoose
const {ObjectId} = Schema

const featureSchema = Schema({
   name:{
      type: String,
      required: true
   },
   qty:{
      type: Number,
      required: true
   },
   itemId:{
      type: ObjectId,
      ref: 'Item'
   },
   imageUrl:{
      type: String,
      required: true
   },
})

module.exports = mongoose.model('Feature', featureSchema)