import pkg from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = pkg.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        minlength: 3,
        maxlength: 50
    },
    email: {
        type: String,
        required: [true, 'Please provide email'],
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email'
        ],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please provide password'],
        minlength: 6
    },
    lastName: {
      type: String,
      trim: true,
      maxlength: 20,
      default: 'lastName',
    },
    location: {
      type: String,
      trim: true,
      maxlength: 20,
      default: 'my city',
    },
});

UserSchema.pre('save', async function () { 
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.createJWT = function () {
    return jwt.sign({ userId: this._id, name: this.name }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME
    });
}

UserSchema.methods.comparePassword = async function (candidatePassword) {
    // compare the candidate password with the hashed password in the database.
    const isMatch = await bcrypt.compare(candidatePassword, this.password);
    return isMatch;
}

export default pkg.model('User', UserSchema);