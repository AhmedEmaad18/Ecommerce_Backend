exports.authorize=(...allowroles)=>{
    return(req,res,next)=>{
        if(!allowroles.includes(req.user.role)){
            return res.status(403).json({message:'access denied'})
        }
        next();
    }

}