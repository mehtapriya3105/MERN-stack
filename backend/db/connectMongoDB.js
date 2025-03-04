import mongoose from "mongoose";

const connectMongoDB   = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Connected to MongoDB successfully");
    }catch(error){
        console.error("Failed to connect to MongoDB");
        process.exit(1);
    }
}

export default connectMongoDB;