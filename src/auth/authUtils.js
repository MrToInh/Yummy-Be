"use strict";

const JWT = require("jsonwebtoken");
const { asyncHandle } = require("../helper/asyncHandler");
const { AuthFailError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/Users/keyToken.service");
const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
  REFRESHTOKEN: "x-rftokens-id",
};

const createTokenPair = async (payload, publickey, privatekey) => {
  try {
    const accessToken = await JWT.sign(payload, publickey, {
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privatekey, {
      expiresIn: "7 days",
    });

    JWT.verify(accessToken, publickey, (err, decode) => {
      if (err) {
        console.log(`error verify:: `, err);
      } else {
        console.log(`verify success:: `, decode);
      }
    });

    return { refreshToken, accessToken };
  } catch (error) {
    console.log(error);
  }
};

const authorization = asyncHandle(async (req, res, next) => {
  /*
    1 - check userID missing
    2 - get accessToken 
    3 - verify Token
    4 - check keyStore with this userId
    6 - OK all => return next() 
    */
  //1
  const userId = req.headers[HEADER.CLIENT_ID];
  if (!userId) throw new AuthFailError(" Invalid request");
  //2
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("not found key in dbs");

  //3
  if (req.headers[HEADER.REFRESHTOKEN]) {
    try {
      const refreshToken = req.headers[HEADER.REFRESHTOKEN];
      const decodeUser = JWT.verify(refreshToken, keyStore.privateKey);
      if (userId != decodeUser.userId)
        throw new AuthFailError("invalid UserId");
      req.keyStore = keyStore;
      req.user = decodeUser;
      req.refreshToken = refreshToken;
      return next();
    } catch (error) {
      throw error;
    }
  }
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailError("Invalid request");
  try {
    const decodeUser = JWT.verify(accessToken, keyStore.publicKey);
    if (userId != decodeUser.userId) throw new AuthFailError("Invalid User");
    req.keyStore = keyStore;
    req.user = decodeUser;
    return next();
  } catch (error) {
    throw error;
  }
});
const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};
module.exports = { createTokenPair, verifyJWT, authorization };
