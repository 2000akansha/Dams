import mongoose from 'mongoose';

const queryMessageSchema = new mongoose.Schema({
    updatedBy: {
        type: String,
        required: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    message: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        enum: ['0', '1', '2'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    beneficiaryQueryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BeneficiaryQuery',
        required: true
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    }
});

const queryMessage = mongoose.model('queryMessage', queryMessageSchema);
export default queryMessage;
