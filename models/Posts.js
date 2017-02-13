var mongoose = require('mongoose');

var PostSchema = new mongoose.Schema({
  username: String,
  roomId: String,
  room_link: String,
  likes:String,
  roomname:String
});


mongoose.model('Posts', PostSchema);