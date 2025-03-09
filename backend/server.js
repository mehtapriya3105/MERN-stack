import authRoutes from "./routes/auth.routes.js";
import postRoutes from "./routes/post.routes.js";
import notificationRoutes from "./routes/notification.routes.js";
import router from "./routes/user.routes.js";

import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import {v2 as cloudinary} from "cloudinary";

import connectMongoDB from "./db/connectMongoDB.js";

// load environment variables from.env file
const app = express();
const PORT = process.env.PORT || 5001;
dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_KEY_SECRET,
});


//parsers to parse incoming requests
app.use(express.json({ limit: "5mb" }));//parse JSON requests
// limit should not be too large since in case of the cyber attacks, it could lead to DOS attacks on the server
app.use(express.urlencoded({ extended: true }));//parse URL encoded requests
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/users",router);   
app.use("/api/posts",postRoutes);
app.use("/api/notifications",notificationRoutes);
console.log(process.env.MONGODB_URI);

// connect to MongoDB and start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});


