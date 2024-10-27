import mongoose from 'mongoose';

const webUserRegistrationSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
   
    password: {
        type: String,
        required: true,
        minlength: 6, 
    },
    fullName: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: true,
        unique: true,
        match: [/^\d{10}$/, 'is invalid'],
    },
    userRole: {
        type: String,
        enum:['0','1','2'],
        required: true
    },
});

export const webUserRegister = mongoose.model('webUserRegistration', webUserRegistrationSchema);
