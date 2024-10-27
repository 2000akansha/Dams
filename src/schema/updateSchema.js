import mongoose, { mongo } from "mongoose";
  const updateSchema = new mongoose.Schema({
    updatedAt:{
        type:Date,
        required:true,
    },
    updatedBy:{
        type:user._id,
        required:true
    },
    role:{
        type: String,
        enum:['0','1','2','3'],
        required:true,
    },
userName:{
    type:string,
    required:true,
},
action:{
    type: string,
    enum:['create','update','delete'],
    required:true
}

  });
  export const update = mongoose.Model('update',updateSchema);