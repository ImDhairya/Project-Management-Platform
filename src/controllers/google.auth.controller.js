import { asyncHandler } from "../utils/async-handler.js";
import {
  get_access_token,
  get_profile_data,
  request_get_auth_code_url,
} from "../utils/oauth.utils.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api.response.js";
import { sendEmail } from "../utils/mail.js";

export const googleAuthProvider = asyncHandler(async (req, res) => {
  console.log(request_get_auth_code_url, "here it is");
  res.redirect(request_get_auth_code_url);
});

export const handleGoogleAuthProvider = asyncHandler(async (req, res) => {
  const authorization_token = req.query.code;

  const response = await get_access_token(authorization_token);

  const { access_token } = response.data;

  const userData = await get_profile_data(access_token);

  const { email, name, picture } = userData.data;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      username: name,
      isEmailVerified: true,
      avatar: {
        url: picture,
        localPath: "/",
      },
    });
  }

  const userRefreshToken = user.generateRefreshToken();
  const userAccessToken = user.generateAccessToken();

  // Save refresh token in DB
  user.refreshToken = userRefreshToken;
  const usr = user.toObject();
  delete usr.password;
  delete usr.refreshToken; // also hide refresh token

  res
    .status(200)
    .cookie("accessToken", userAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .cookie("refreshToken", userRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })
    .json(
      new ApiResponse(
        200,
        {
          user: usr, // sanitized user object
          accessToken: userAccessToken,
        },
        "Login successful",
      ),
    );
});
