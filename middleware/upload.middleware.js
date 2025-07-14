const multer=require('multer')
const path = require('path'); // Import the path module


const filefilter=(req,file,cb)=>{
    const ext= path.extname(file.originalname).toLowerCase();
    const allowed=['.jpg','.png','.jpeg']
    if(!allowed.includes(ext)){
        return cb(new Error('error'))
    }
    else{
        return cb(null,true)
    }
}
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads'); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); 
    }
});
const MB=1024*1024;
const upload=multer({
    storage,
    filefilter,
    limits:{fileSize:2*MB}
})
module.exports={upload}
