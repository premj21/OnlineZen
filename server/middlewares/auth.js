import  Jwt  from "jsonwebtoken";
import {User} from '../models/User.js';

const Authenticated = async(req,res,next)=>{
const {token} = req.cookies;
if(!token) return res.status(401).json({success:false,message:"Not logged in"}); 
const getuser = Jwt.verify(token,process.env.JWT_SECRET);
 req.user = await User.findById(getuser._id);
 next(); 
}

 export const authorizedadmin = async(req,res,next)=>{
  if(req.user.role !=='admin') return res.status(403).json({
    success:false,
    message:`user not allowed to access this resource `
  });
 next(); 
}


export default Authenticated ; 