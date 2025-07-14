const mongoose=require('mongoose');
const brandSchema = new mongoose.Schema({
    name: { 
        type: String,
        required: true 
    },
    description:{
        type:String,
        required:true,
        default:""
    },isactive:{
        type:Boolean,
        default:true
    }
});
module.exports= mongoose.model('Brand', brandSchema);
