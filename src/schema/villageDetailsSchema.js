import mongoose from 'mongoose';

const villageDetailsSchema = new mongoose.Schema({
    villageName: {
        type: String,
        required: true,
        maxlength: 300,
        minlength: 3
    },
    excelUpload: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'excelUpload'
    },
    villageCode: {
        type: Number,
        maxlength: 6,
        minlength: 6,
        required: true
    },
    update: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'update'
    },
    villageArea: {
        type: Number,
        required: true
    },
    khatauni: {
        type: Number,
        required: true
    },
    totalBeneficiaries: {
        type: String,
        required: true
    },
    villageStatus: {
        type: String,
        enum: ['0', '1'],
        required: true
    },
    isDeleted: {
        type: String,
        enum: ['0', '1'],
        required: true
    },
    landPriceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'landPrice' // Changed to reference the model name
    }
});

export const villageDetails = mongoose.model('villageDetails', villageDetailsSchema);
