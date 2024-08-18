"use strict";

const express = require("express");
const accessController = require("../../../controllers/Users/access.controller");
const { asyncHandle } = require("../../../helper/asyncHandler");
const { authorization } = require("../../../auth/authUtils");
const router = express.Router();
//signup
router.post("/user/signup", asyncHandle(accessController.singUp));

//singin
router.post("/user/login", asyncHandle(accessController.login));

//authorization
router.use(authorization);

//logout
router.post("/user/logout", asyncHandle(accessController.logout));

router.post(
  "/user/handelRefeshToken",
  asyncHandle(accessController.refreshToken)
);
module.exports = router;
