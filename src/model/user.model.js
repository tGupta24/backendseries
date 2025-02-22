import mongoose, { Schema } from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import dotenv from "dotenv"
dotenv.config();

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String, // cloudnary url
            required: true,
        },
        coverImage: {
            type: String, // cloudnary url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video",
            }
        ],
        password: {
            type: String, // to be enctypted
            required: [true, "password is required"]
        },
        refreshToken: {
            type: String
        }
    }
    , { timestamps: true })


//pre hook
userSchema.pre("save", async function (next) {

    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next()
})
//  custome method

userSchema.methods.isPasswordCorrect = async function (password) {
    try {
        console.log("password to be changed isf", password)
        if (!password) {
            throw new Error("Password comparison failed: missing data or hash");
        }
        return await bcrypt.compare(password, this.password);
    } catch (error) {
        console.error("Error comparing password:", error.message);
        return false; // Return false instead of throwing an error to prevent crashes
    }
};


userSchema.methods.generateAccessToken = function () {
    return jwt.sign( // it generate token
        //payload
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullname: this.fullname
        },
        //secret key
        process.env.ACCESS_TOKEN_SECRET,
        //options
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign( // it generate token
        //payload
        {
            _id: this._id,

        },
        //secret key
        process.env.REFRESH_TOKEN_SECRET,
        //options
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)