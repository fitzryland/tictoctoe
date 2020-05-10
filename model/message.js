const mongoose = require('mongoose');
const {Schema} = mongoose;

const MessageSchema = new Schema({
  'box': String,
  'created': Date
})

module.exports = mongoose.model('message', MessageSchema);