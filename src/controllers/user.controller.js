import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js"
import { User } from "../model/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import mongoose, { Aggregate } from "mongoose";
dotenv.config()







const generateAccessAndRefereshTokens = async (userId) => {
    try {
        console.log("User id received to generate token");
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken

        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res


    const { fullName, email, username, password } = req.body
    //console.log("email: ", email);

    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required")
    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }
    //console.log(req.files);

    const avatarLocalPath = req.files?.avatar[0]?.path;
    //const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }


    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )

})

const loginUser = asyncHandler(async (req, res) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie

    const { email, username, password } = req.body


    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }
    console.log(`got ${email} or ${username} and ${password}`);

    // Here is an alternative of above code based on logic discussed in video:
    // if (!(username || email)) {
    //     throw new ApiError(400, "username or email is required")

    // }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }
    console.log(`user is found user:`, user);

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }
    console.log("provided password is correct");

    const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)

    console.log("tokens is generated");

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    console.log("User is logged in here is the details", loggedInUser)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInUser, accessToken, refreshToken
                },
                "User logged In Successfully"
            )
        )

})

const logOutuser = asyncHandler(async (req, res) => {
    //
    console.log("finding user from req.user._id");
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 // this removes the field from document
            }
        },
        {
            new: true
        }
    )
    console.log(`user found and tokens is deleted and logged out done`)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "User logged Out"))
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    try {
        // incoming token
        const incomingRefreshToken = await req.cookies.refreshToken || req.body.refreshToken
        // if not
        if (!incomingRefreshToken) {
            throw new ApiError(404, "unauthorised refresh Token")
        }
        console.log("Incoming Refresh Token is here...", incomingRefreshToken);
        // get decoded token using jwtverify()
        const decodedToken = await jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

        // now get user because we need 
        const user = await User.findById(decodedToken?._id)
        if (!user) {
            throw new ApiError(401, "invalid refresh token");
        }
        console.log("Got user with the help of id present in IncomingRefreshToken")

        // now we have two token, one in data base and  other is incoming so match them
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "InValid refresh Token ||OHHO token present in your cookie of body is not matched with the token present in database ")
        }
        console.log("token matched with db ")

        const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(user._id)
        console.log("both token are generated refreshToken:", refreshToken, " accessToken: ", accessToken)

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    {
                        accessToken,
                        refreshToken: refreshToken
                    },
                    "Access Token Refreshed "
                )
            )



    } catch (err) {
        throw new ApiError(400, err?.message || "invalid refrsh token");
    }
})

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body
    // if (oldPassword === newPassword) { ye chiz toh fronted vala hi ssambhal lega

    // }
    if (!(oldPassword || newPassword)) {
        throw new ApiError(400, "please provide password to change oldPassword");
    }
    console.log("Got new Password and oldPassword")
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new ApiError("unauthorised user try to change password");
    }
    console.log("Got user:", user)
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid old password");
    }
    console.log("changed and added to db")
    user.password = newPassword
    await user.save({ validateBeforeSave: false });

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                "Password change succesfully"
            )
        )

})

const getCurrentUser = asyncHandler(async (req, res) => {

    return res
        .status(202)
        .json(
            new ApiResponse(202, req.user, "currect user fetched succesfully")
        )
})

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body
    if (!fullName || !email) {
        throw new ApiError(400, "all fields are required");
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,  // id
        {  // properties to be update
            $set: {
                fullName: fullName,
                email: email
            }
        },
        {       // new so that new propertires will be given as a res and will store in user

            new: true
        }
    ).select("-password"); // 

    return res.status(200)
        .json(
            new ApiResponse(200, user, "your account details are updated")
        )
})

const updateUsercoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path

    if (!coverImageLocalPath) {
        new ApiError(400, "coverImage file is missing");
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!coverImage.url) {
        new ApiError(500, "Error while uploading on cloudinary");
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }

        },
        {
            new: true,
        }

    ).select("-password");

    return res.status(200).json(
        new ApiResponse(
            200, user, "coverImage is updated succesfully"
        )
    )
})
const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path

    if (!avatarLocalPath) {
        new ApiError(400, "avatar file is missing");
    }
    // avatar is found
    console.log("avatar is found")

    const avatar = await uploadOnCloudinary(avatarLocalPath)

    if (!avatar.url) {
        new ApiError(500, "Error while uploading on cloudinary");
    }

    console.log("uploaded to cloudinary")
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }

        },
        {
            new: true,
        }

    ).select("-password");
    console.log("updated")

    return res.status(200).json(
        new ApiResponse(
            200, user, "avatar is updated succesfully"
        )
    )
})

const getUserChannelProfile = asyncHandler(async (req, res) => {

    const { username } = req.params // because we open a page using url jiski profile dekhni h
    if (!username?.trim()) {
        throw new ApiError(400, "username is missing");
    }

    const channel = await User.aggregate(
        [
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subsciptions", // this is Subscription model but in data base it is save as plural and lowercase 
                    localField: "_id",
                    foreignField: "channel", // subscription model me jao and find in how many document this user is as a channel
                    as: "subscribers"
                }
                // yaha tk jitne bhi subscription model me ye user as a channel he vo model yaha add ho gaye honge ek array me
            },
            {
                $lookup: {
                    from: "subsciptions",
                    localField: "_id",
                    foreignField: "subscriber", // is user ne kis kis ko subscribe kiya he ?? toh subscription model me jao or ye user as a subscriber kitne documennts me he vo pata karo 
                    as: "subscribedTo"
                    // yaha tk ek subscribedTo nam ka array add ho gya user ke annder
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers" // iis array ki size hi toh iske subscriber honge so add a new field
                    },
                    channelsSubscribedToCount: {
                        $size: "$subscribedTo" // and this one is whom he/she subscribedTo
                    },
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                },
            },
            {
                $project: { // jo jjo bhejna he as a profile
                    fullName: 1,
                    username: 1,
                    avatar: 1,
                    coverImage: 1,
                    subscribersCount: 1,
                    channelsSubscribedToCount: 1,
                    isSubscribed: 1,
                    email: 1
                }
            }
        ]
    )
    console.log(channel)
    if (!channel?.length) {
        throw new ApiError(401, "channel does not exists");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, channel[0], "user channel fetched succesfully"))
})

const getWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id),
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory", // it is an array 
                foreignField: "_id",  // id of video model mongoose will match every element two that id
                as: "watchHistory",// watch history is ovewritten
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1,
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res.status(200)
        .json(
            new ApiResponse(200, user[0].watchHistory, "watch History get Succesfully")
        )
})











export { registerUser, loginUser, logOutuser, refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateUserAvatar, updateUsercoverImage, getUserChannelProfile, getWatchHistory };




