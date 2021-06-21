const mongoose = require('mongoose');
const { Schema } = mongoose;

//how to define your first every schema? How can you always forget the syntax bro? how dumb
//can you really get??? It's hard 

const questionSchema = new Schema({
    question : String,
    description : String,
    author : String
})

module.exports = mongoose.model('Question', questionSchema);