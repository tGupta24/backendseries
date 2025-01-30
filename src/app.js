import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"
dotenv.config()

const app = express();

app.use(cors());  // this is simple usage

app.use(cors(  // this is also a different way of using cors
    // corsoptionsrs
    {
        origin: process.env.CORS_ORIGIN, // origin of frontend from where you will request
        credentials: true,
    }
))

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"));  // public is name of folder in case if any folder and assests



app.use(cookieParser())





// ROUTES
import UserRouter from "./routes/user.routes.js";

// routers declaration
// pehle aap vahi route likh rahe the toh
// app.get se kam chal raha tha but controller likha h route bhi separte toh aapko middleweare use karna padega or middleware use karte he toh app.use ka use karte he

app.use("/api/v1/users", UserRouter)
// http://localhost:8000//api/v1/users/register and control pass to userrouter














export default app;

