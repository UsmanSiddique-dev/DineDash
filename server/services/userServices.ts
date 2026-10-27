import { User } from "../models/User.js";

export const findUserById = async (id:string)=>{
    const user= await User.findById(id).select("-password")
    
    return user;
}