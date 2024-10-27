import mongoose from 'mongoose';

const uploadDocsDetailsSchema = new mongoose.Schema({
    // khatauniSankhya: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'khatauniDetails',
    //     required: true,
    // },
    // khasraNumber: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'khatauniDetails',
    //     required: true,
    // },
    // areaVolume: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'khatauniDetails',
    //     required: true,
    // },
  
    // remarks: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'remark'
    // },
    // beneficiaryCount:{
    //     type:Number,
    //     required:true
    // },
    // beneficiaryName: {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: 'beneficiaryDetails',
    //     required: true,
    // },
    landIndemnityBond: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    structureIndemnityBond: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    uploadAffidavit: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    aadhaarCard: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    panCard: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    chequeOrPassbook: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    aadhaarNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    panCardNumber: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    photo: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
    isConsent: {  
        type: mongoose.Schema.Types.ObjectId,
        ref:'beneficiaryDocs',
        required: true
    },
});
 export const uploadDocsDetails = mongoose.model('uploadDocsDetails', uploadDocsDetailsSchema)