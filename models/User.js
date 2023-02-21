const mongoose = require('mongoose')
const {Schema} = mongoose
const bcrypt = require('bcryptjs')

const userSchema = Schema({
   username:{
      type: String,
      required: true
   },
   password:{
      type: String,
      required: true
   }
})

userSchema.pre('save', async function(next){
   const user = this
   if(user.isModified('password')){
      user.password = await bcrypt.hash(user.password,8,)
   }
})

module.exports = mongoose.model('User', userSchema)