import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    //member since july 2021
    username: {
        type: String,
        required: true,
        unique: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,//followed need to be a mongodb id
            ref: "User",//folowed user schema
            default: [],
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            default: [],
        }
    ],
    profileImg: {
        type: String,
        default: "",
    },
    coverImg: {
        type: String,
        default: "",
    },
    bio : {
        type: String,
        default: "",
    }
},
   { timestamps: true},
);

const User = mongoose.model("User", userSchema);//users

export default User;