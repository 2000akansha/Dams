import mongoose from 'mongoose';

const querySchema = new mongoose.Schema({
    updatedBy: {
        type: String,
    },
    updatedAt: {
        type: Date,
    },
    message: {
        type: String,
    },
    Level: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'Verification',
        required:true,
      },
    userRole: {
        type: String,
        enum: ['0', '1', '2', '3'],
        default: '0',
    },
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Verification',  // "0" for Pending, "1" for Approved (or vice versa)
        default: '0',
        required: true // Default status is 'Pending'
    },

    name: {
        type: String,
    },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }

})
const query = mongoose.model('querySchema', querySchema);

export default query;