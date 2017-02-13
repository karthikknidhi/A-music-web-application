var mongoose = require('mongoose');

var ChatSchema = new mongoose.Schema({
  username: String,
  msg: String,
  roomnumber:String
});


mongoose.model('Chats', ChatSchema);