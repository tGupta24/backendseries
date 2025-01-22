import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
dotenv.config()

const app = express();

app.use(cors());  // this is simple usage

app.use(cors(  // this is also a different way of using cors
    // corsoptions
    {
        origin: process.env.CORS_ORIGIN, // origin of frontend from where you will request
        credentials: true,
    }
))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));  // public is name of folder in case if any folder and assests



app.use(cookieParser())














export default app;

