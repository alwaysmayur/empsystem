const jwt = require("jsonwebtoken");
const userdb = require("../db/mongoDB/schema/userSchema");
const connectionMongoDB = require("../../utility/db/mongoDB/connection");
const keysecret = process.env.ACCESS_KEY;

const authenticate = async (req) => {
  try {
    // Get token from request header's authorization
    let token = req.headers.get("authorization");
    // Split token and Bearer so we get Brearer Text at token[0] intex and token at token[1] index
    token = token.split(" ")[1];

    // Verify token in JWT
    const verifytoken = await jwt.verify(token, keysecret);

    // Verify token in JWT if token verify then in response it will document id using that id get data from database
    const rootUser = await userdb.findOne({ _id: verifytoken._id });

    // If we found data then return data otherwise throw error
    if (!rootUser) {
      throw new Error("user not found");
    }
    if (rootUser.token !== token) {
      return { status: 401, message: "Unauthorized or invalid token!" };
    } else {
      return {
        token,
        rootUser,
        id: rootUser._id,
      };
    }
  } catch (error) {
    console.log("====================================");
    console.log(error);
    console.log("====================================");
    // Handle exception
    return { status: 401, message: "Unauthorized or invalid token!" };
  }
};
module.exports = authenticate;
