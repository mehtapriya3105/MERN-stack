import User from  "../models/user.models.js";
import jwt from "jsonwebtoken";
export const protectRoute = async (req, res, next) => {
    try{
        const token = req.cookies.jwt;//get token from cookie
        if(!token){
            return res.status(401).json({error: "No token found in cookie" });
        }
        const decode = jwt.verify(token, process.env.JWT_SECRET);//verify the current token with the previous sercret
        if(!decode){
            return res.status(401).json({error: "Token is invalid"});
        }
        const user = await User.findById(decode.userId).select("-password");//only return user id and username , password is not returned
        if(!user){
            return res.status(401).json({error: "You are not authenticated"});
        }
        req.user = user;//set user object in request
        next();//move to the next middleware function - getMe
    }
    catch(error){
        console.error("Error in protectRoute middleware: ", error);
        res.status(500).json({error: error.message});
    }
};

//next is used so that when the current middleware function is done, the next middleware function in the stack will be executed.