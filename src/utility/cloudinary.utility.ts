import { rejects } from "assert"
import { v2 as cloudinary} from "cloudinary"
import fs from 'fs'



cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key:process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloudinary = async (buffer:Buffer) : Promise < string | null > =>{
    try {
        const response = await new Promise<any> ((resolve,reject) =>{
    
            const stream = cloudinary.uploader.upload_stream({
                resource_type:"auto",
                folder: "profile"
            },
            (error,result) =>{
                if(error || !result) return reject(error);
                resolve(result)
            }
        );
        stream.end(buffer);
        });
        console.log("file upload to cloudinary:",response.secure_url)
    
        return response.secure_url;
    } 
    catch (error:unknown) 
    {
       console.error("cloudinary upload failed:", error) 
       return null
    }
}

export { uploadOnCloudinary  }
