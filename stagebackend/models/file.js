const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    name: {
        type: String,
        required: true
    }, 
    content: {
        type: String,
        default: ''
    },
    language: {
        type: String,
        required: true
    }
},
{ timestamps: true });

const File = mongoose.model('File', fileSchema);
module.exports = File;

