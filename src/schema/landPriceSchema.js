import mongoose from "mongoose";
 const landPriceSchema = new mongoose.Schema({
    update:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'update'
    },
    excelUpload: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'excelUpload'
    },

    villageId:{
         type:mongoose.Schema.Types.ObjectId,
        ref:village._id,
        unique:true
        },
        landPricePerSqMt:{
            type:Number,
            required:true,
        },
        active:{
            type:String,
            enum:['0','1'],
            required:true
        }
    
 })

 export const landprice = mongoose.model('landPrice', landPriceSchema);