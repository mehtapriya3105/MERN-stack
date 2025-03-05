import jwt from "jsonwebtoken";

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  res.cookie("jwt", token, {
    maxAge: 900000, // 15 days
    httpOnly: true, // secure cookies only (https) - xxs protection
    samesight: true, // crsf - prevent cross-site request attacks
    secure: process.env.NODE_ENV !== "developement", // true for production, false for development
  });
};

// once user signups or logs in, we generate a token and set a cookie with it on the client side 
// when the user makes subsequent requests, we validate the token on the server side
// if the token is valid - same as what is generated, we allow the request to proceed, otherwise, we respond with an unauthorized error