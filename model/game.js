const mongoose = require('mongoose');
const {Schema} = mongoose;

const MessageSchema = new Schema({
  'name': String,
  'state': Object
})

module.exports = mongoose.model('game', MessageSchema);