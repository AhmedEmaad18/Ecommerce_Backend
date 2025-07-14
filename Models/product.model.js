const mongoose=require('mongoose');
const productSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    desc:{
        type:String,
        required:true
    },
    price:{
         type:Number,
         require:true
    },
    imageURL:{
        type:[String], 
      default:''
    },category:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        require:true,
    },brand:{
        type:mongoose.Schema.Types.ObjectId,   
        ref: 'Brand',
        required:true   
    },subcategory:{
        type:mongoose.Schema.Types.ObjectId,
        ref: 'Subcategory',
        require:true,
    },
    stock: 
    {
    type: Number, required: true, default: 0
    },
    isOutOfStock:
    { 
    type: Boolean, default: false 
    },
    isactive:
    {
     type:Boolean,
     default:true
    }

},{timestamps:true}
)
module.exports=mongoose.model('Product',productSchema)