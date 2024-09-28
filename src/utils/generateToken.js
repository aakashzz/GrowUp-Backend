import JWT from "jsonwebtoken";

export const generateAccessToken = (_id,email)=>{
    const accessToken = JWT.sign({
        id:_id,
        email:email,
    },
        process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY
    },
    );
    return {accessToken};
}
export const generateRefreshToken = (_id)=>{
    const refreshToken = JWT.sign({
        id:_id,
    },
        process.env.REFRESH_TOKEN_SECRET,
    {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY
    },
    );
    return {refreshToken};
}