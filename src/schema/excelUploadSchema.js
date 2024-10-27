import mongoose from 'mongoose';

const excelUploadSchema = new mongoose.Schema({
    khatauniSankhya: {
        type: Number,
        required: true      
    },
    serialNumber: {
        type: Number,
        required: true,
        unique: true
    },
    beneficiaryName: {
        type: String,
        required: true,
        maxlength: 250,
        minlength: 3
    },
    khasraNumber: {
        type: String,
        required: true
    },
    acquiredKhasraNumber: {
        type: String,
        required: true
    },
    areaVolume: {
        type: String,
        required: true
    },
    acquiredRakhba: {
        type: String,
        required: true
    },
    share: {
        type: String,
        required: true
    },
    beneficiaryShare: {
        type: String,
        required: true
    },
    landPricePerSqMt: {
        type: Number,
        required: true,
    },
    compensationBhoomi: {
        type: Number,
        required: true,
    },
    compensationGairFaldaar: {
        type: Number,
        required: true,
    },
    compensationFaldaar: {
        type: Number,
        required: true,
    },
    compensationmakaan: {
        type: Number,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    compensation: {
        type: Number,
        required: true,
    },
    totalCompensation: {
        type: Number,
        required: true,
    },
    interestAmount: {
        type: Number,
        required: true,
    },
    completeCompensation: {
        type: Number,
        required: true,
    },
    vivran: {
        type: Number,
        required: true,
    },
});

export const excelUpload = mongoose.model('ExcelUpload', excelUploadSchema);  // Notice the change in the model name to "ExcelUpload"
