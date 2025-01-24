import mongoose from "mongoose";
import connectDB from "./db/index.js"
import dotenv from 'dotenv';
dotenv.config();
import app from "./app.js"


// import express from "express"
// const app = express();

// if want to import from outside file where db is connected
connectDB()
    .then(() => {
        app.on("error", (error) => {        //for error                                        
            console.log(`APP.ON ERROR:`, error);
            throw error
        })
        app.listen(process.env.PORT || 8000, () => {
            console.log(`SERVER IS LISTENING at ${process.env.PORT}`)
        })
    })
    .catch((err) => {
        console.log(`MONGO db connection FAILED !!!`, err)
    })

/*
      if want to connect direct in index.js file 

// this is iife imediately invoked function
; (
    () => { }
)() // sath hi sath () iski help se execute bhi kar diya

    ; (async () => {
        try {


            const db = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
            console.log(db.connection.host)



            app.on("error", (error) => {
                console.log("::ERROR", error);
                throw error
            })
            app.listen(process.env.PORT, () => {
                console.log("app is listerning")
            })

        } catch (error) {
            console.log("error:", error);
            throw error
        }
    })()

*/