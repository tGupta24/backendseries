import mongoose from "mongoose";
import { Schema } from "mongoose";
import { refreshAccessToken } from "../controllers/user.controller";

const subscriptionSchema = new Schema(
    {
        subscriber: { // one who is subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        },
        channel: { // whom subscribing
            type: Schema.Types.ObjectId,
            ref: "User"
        }

    },
    {
        timestamps: true
    }
)

export const Subsciption = mongoose.model("Subsciption", subscriptionSchema)


