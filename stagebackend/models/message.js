const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User'
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: {
      type: String,
      required: true
    },
  }, { timestamps: true });
  
  const Message = mongoose.model('Message', messageSchema);
  module.exports = Message;
  