import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 5001;
dotenv.config();


//parsers to parse incoming requests
app.use(express.json());//parse JSON requests
app.use(express.urlencoded({ extended: true }));//parse URL encoded requests
app.use(cookieParser());

// routes
app.use("/api/auth", authRoutes);


console.log(process.env.MONGODB_URI);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});


