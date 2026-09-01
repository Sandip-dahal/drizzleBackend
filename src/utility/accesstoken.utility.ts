import jwt from "jsonwebtoken"

type accessTokenPayload = {
    id: string;
    name: string,
    email:string,
    age: number,
    number: string,
    profile: string,
    createdAt: Date,
    updatedAt: Date,

}

function generateAccessToken(user: accessTokenPayload){
    return jwt.sign(
        {
            id:user.id,
            email: user.email,
            name: user.name,
            age: user.age,
            number: user.number,
            profile: user.profile,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            
        },
        
            process.env.ACCESS_TOKEN_SECRET as string,

        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
        })
}

function generateRefreshToken(user:{id:string}){
    return jwt.sign({
        id: user.id
    },
        process.env.REFRESH_TOKEN_SECRET as string,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    })
}

export {generateRefreshToken, generateAccessToken}

