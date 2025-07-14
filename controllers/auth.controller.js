const User = require('../Models/user.model');
const JWT=require('jsonwebtoken');


const signtoken= (user)=>{
    return JWT.sign({id:user._id,role:user.role,name:user.name},process.env.JWT_SECRET,{expiresIn:process.env.JWT_EXPIRES_IN||'1d'});
}
exports.login = async (req, res) => {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });
    
    // Check if user exists and if the password is correct
    if (!user || !(await user.correctPassword(password))) {
        return res.status(400).json({ message: 'Email or password not valid' });
    }
    const token=signtoken(user);

    return res.status(200).json({ message: 'You are logged in',token });
};
