import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js"
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { User } from "../model/user.model.js";
dotenv.config();

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", ""); // we only need token
        // Authorization:Bearer space <tokenName>

        if (!token) {
            throw new ApiError(401, "Unauthorized request");
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)


        // since decodedToken is accesTokenn so it has id also
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")


        if (!user) {
            ///TODO: discuss about frontend
            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, "invalid access token")
    }
});
