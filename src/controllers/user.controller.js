import { asyncHandler } from "../utils/asyncHandler.js"
import ApiError from "../utils/ApiError.js"
import { User } from "../model/user.model.js"
import uploadOnCloudinary from "../utils/cloudinary.js"

import { ApiResponse } from "../utils/ApiResponse.js"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId); // get user from db

        const refreshToken = user.generateAccessToken()// generate tokens
        const accessToken = user.generateRefreshToken()
        user.refreshToken = refreshToken;            // update refresh token to db
        await user.save({ validateBeforeSave: false }); // save user without validation
        return { accessToken, refreshToken } // return both
    }
    catch (err) {
        throw new ApiError(500, "something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validation - not empty
    // check if user already exist  username e
    // mail
    //
    // check for avatar like imgs
    // if available upload them to cloudinary, check avatar again
    // create user objecct create entry in db
    // remove password and refresh token field from response
    // check for usercreation 
    // return respo


    // 1 get user detail if user sends data using form or json will receive in req.body
    const { fullName, email, username, password } = req.body

    // console.log(req.body);



    //validation 

    // if (fullName === "") {
    //     throw new ApiError(400, "fullName is required");
    // }
    if (
        [fullName, email, username, password].some((field) => field?.trim() === "")
    ) {
        throw new ApiError(400, "All fields are required");
    }


    // if user already exist or not
    // if username only  .findOne({username})
    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (existedUser) {
        throw new ApiError(409, "User with email or username already exist");
    }

    //handle imges
    // multer req.files me metadata dal dega 
    // just like
    // req.files = {
    //     avatar: [
    //         {
    //             fieldname: "avatar",
    //             originalname: "avatar.jpg",
    //             encoding: "7bit",
    //             mimetype: "image/jpeg",
    //             destination: "./public/temp",
    //             filename: "avatar.jpg",
    //             path: "./public/temp/avatar.jpg",
    //             size: 12345
    //         }
    //     ],
    //     coverImage: [
    //         {
    //             fieldname: "coverImage",
    //             originalname: "cover.jpg",
    //             encoding: "7bit",
    //             mimetype: "image/jpeg",
    //             destination: "./public/temp",
    //             filename: "cover.jpg",
    //             path: "./public/temp/cover.jpg",
    //             size: 23456
    //         }
    //     ]
    // };

    const avatarLocalePath = req.files?.avatar[0]?.path;
    // TODO avatarLocalPath should be req

    let coverImageLocalePath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files?.coverImage[0]?.path) {
        coverImageLocalePath = req.files?.coverImage[0]?.path
    }


    // console.log(req.files)
    // ;

    if (!avatarLocalePath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // upload them to  cloudinary

    const avatar = await uploadOnCloudinary(avatarLocalePath)
    const coverImage = await uploadOnCloudinary(coverImageLocalePath)
    // but if avatar is not uploaded on cloudinary then check
    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    console.log(avatar)


    // entry in db

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "", // cover img he ya nahi ye jaruri nahi h
        email,
        password,
        username: username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registerd  succesfully")
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
    console.log("bhen ke lund")


    // if (!username && !email) {
    //     throw new ApiError(400, "username or email is required")
    // }

    // Here is an alternative of above code based on logic discussed in video:
    if (!(username || email)) {
        throw new ApiError(400, "username or email is required")

    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

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

// problem in logout is kisko logout karwana he
// user ka access toh he hi nahi 
// so we add a user with the help of  middleware and also verify the route
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id, //  find by
        {            // what to update
            $set: {
                refreshToken: undefined,
            }
        },
        {
            new: true, // updated value milegi
        }
    )

    return res // send res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new ApiResponse(200, {}, "user loggout out"))
})



export { registerUser, loginUser, logOutUser };