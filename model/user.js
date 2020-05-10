const mongoose = require('mongoose');
const {Schema} = mongoose;

const UserSchema = new Schema({
  'userId' : String,
  'socketId' : String,
  'userName': String
})

module.exports = mongoose.model('user', UserSchema);