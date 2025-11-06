const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
    {
        name : {
            type : String,
        },
        lastname : {
            type : String,
        },
        email : {
            type: String,
            required: true,
            unique: true
        },
        password : {
            type: String,
            required: true
        },
        role: {
            type: String,
            default: 'user', 
            required: true
        },
        lastActive: {  
            type: Date,
            default: Date.now 
        }
    },
    {timestamps: true}
);

UserSchema.pre('save', function (next) {
    this.lastActive = new Date();  // Met à jour la dernière activité
    next();
});

UserSchema.pre('findOneAndUpdate', function (next) {
    this.set({ lastActive: new Date() }); // Met à jour lastActive lors d'une modification
    next();
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
