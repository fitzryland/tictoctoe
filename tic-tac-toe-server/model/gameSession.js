const mongoose = require('mongoose');
const {Schema} = mongoose;

const MessageSchema = new Schema({
  'name': String,
  'state': Object,
  'id' : String
})

module.exports = mongoose.model('gamesession', MessageSchema);