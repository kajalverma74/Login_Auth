const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { uniqueId } = require('lodash');


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true,unique:true },
    aadharCardNumber: { type: String, required: true, unique: true },
    profileImage: { type: String, unique: false,  }
});

userSchema.pre('save', async function(next){
    const person = this;
 
    if(!person.isModified('password')) return next();
    try{
      
        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(person.password, salt);
        
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})

userSchema.methods.comparePassword = async function(candidatePassword){
    try{
    
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
        
    }catch(err){
        throw err;
    }
}
const User = mongoose.model('User', userSchema);
module.exports = User;
