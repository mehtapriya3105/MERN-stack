import express from "express";
import authRoutes from "./routes/auth.routes.js";
import dotenv from "dotenv";
import connectMongoDB from "./db/connectMongoDB.js";
const app = express();
const PORT = process.env.PORT || 5001;
dotenv.config();

app.use("/api/auth", authRoutes);

console.log(process.env.MONGODB_URI);
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    connectMongoDB();
});


