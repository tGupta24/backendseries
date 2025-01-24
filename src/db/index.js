import mongoose from "mongoose";
import { DB_NAME } from "../constants.js"
import dotenv from 'dotenv';
dotenv.config();

// .connect(url/name)
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(`${connectionInstance}`);  /// it will not give object because it call a implicit to_string method backtick vala
        // console.log("MongoDB connected !! full Object is here", connectionInstance);
    } catch (error) {
        // console.log("MONGODB connection FAILED ", error);
        throw error
    }
}

export default connectDB;

