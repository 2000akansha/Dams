import mongoose from 'mongoose';

const remarkSchema = new mongoose.Schema({
    remark:{
        type:String,
        maxlength:250,
        minglength:10
    },
update:{
   type:mongoose. Schema.Types.ObjectId,
   ref:'update',
   required:true
}
});
export const remark = mongoose.model('remark',remarkSchema);


