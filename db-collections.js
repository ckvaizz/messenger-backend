
import mongoose from 'mongoose'

const userSchema=mongoose.Schema({
    name:String,
    email:String,
    password:String
}); 
export const user = mongoose.model('user',userSchema);

 

 const messagesSchema=mongoose.Schema({
    message:String,
    send:String,
    to:String,
    time:String,

}); 
export const messages = mongoose.model('messages',messagesSchema)