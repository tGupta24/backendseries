import { Router } from "express";
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory,
    loginUser,
    logOutuser,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUsercoverImage
} from "../controllers/user.controller.js";
import { upload } from "../middleware/multer.middleware.js"
import { verifyJWT } from "../middleware/auth.middleware.js";
import { refreshAccessToken } from "../controllers/user.controller.js";

// the basic syntax is app.post(route,middleware,controller function to be executed);

const router = Router();// data ko pahle middleware process karega if any avatar or coverImage aai he toh multer usko publictemp me upload karke response as a metadata req.files me add kar dega
router.post(
    "/register",
    upload.fields(
        [
            { name: "avatar", maxCount: 1, },
            { name: "coverImage", maxCount: 1, }
        ]
    ),
    registerUser);

router.post(
    "/login",
    loginUser
)


//securred routes

router.route("/logout").post(verifyJWT, logOutuser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/changeCurrentPassword").post(verifyJWT, changeCurrentPassword)

router.route("/current-user").get(verifyJWT, getCurrentUser)

router.route("/update-account-details").patch(verifyJWT, updateAccountDetails)

router.route("/avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar)

router.route("/coverImage").patch(verifyJWT, upload.single("coverImage"), updateUsercoverImage)

// taking from params
router.route("/c/:username").get(verifyJWT, getUserChannelProfile)
router.route("/history").get(verifyJWT, getWatchHistory)



export default router;

