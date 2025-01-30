//goal =>file aayegi file system se mtlb server pe toh file he but usko
import { v2 as cloudinary } from "cloudinary"
import fs from "fs" // file system
import dotenv from "dotenv"
import { lookupService } from "dns";

dotenv.config();


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,

    api_key: process.env.CLOUDNARY_API_KEY,

    api_secret: process.env.
        CLOUDNARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) {
            console.log("::PLEASE PROVIDE A LOCALFILEPATH!!!")
            return null
        }
        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        // file has been uploaded
        fs.unlinkSync(localFilePath)
        console.log("YOUR FILE IS UPLOADED ON CLOUDINARY::", response.url);
        return response;

    } catch (err) {
        fs.unlinkSync(localFilePath) // sync mtlab ye hona hi chahiye
        //remove locally saved temp file as the upload ops got failed
        console.log("FILE UPLOAD OPERATION GOT FAILED::", err);
        return null
    }
}

export default uploadOnCloudinary




// resbyclodinary is like = {
//     asset_id: 'c56b5026c3626508b8036e3f9faf4a39',
//     public_id: 'm0bcz7fs7b6ucfnimduw',
//     version: 1737974582,
//     version_id: 'd0cf7e076f3c86c9a0d0ad3d4ae4b440',
//     signature: '2d3db9d0fedd40b9f1f81a906e072cfdfe5d9d7c',
//     width: 1280,
//     height: 963,
//     format: 'jpg',
//     resource_type: 'image',
//     created_at: '2025-01-27T10:43:02Z',
//     tags: [],
//     bytes: 118987,
//     type: 'upload',
//     etag: '259ba66d5d3d1f4ef2ef47fef4a8f0a8',
//     placeholder: false,
//     url: 'http://res.cloudinary.com/dkux9hue1/image/upload/v1737974582/m0bcz7fs7b6ucfnimduw.jpg',
//     secure_url: 'https://res.cloudinary.com/dkux9hue1/image/upload/v1737974582/m0bcz7fs7b6ucfnimduw.jpg',
//     asset_folder: '',
//     display_name: 'm0bcz7fs7b6ucfnimduw',
//     original_filename: 'WhatsApp Image 2024-11-11 at 11.52.10_e79d5ad2',
//     api_key: '133282725681283'
// }


