import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";
import crypto from "crypto";
import jwt from "jsonwebtoken";

export const generateAccessAndRefreshTokens = async (userId) => {
  if (!userId) {
    throw new Error("Please provide a userId to generate tokens.");
  }

  try {
    const user = await User.findById(userId);
    const accessTokens = user.generateAccessToken();
    const refreshTokens = user.generateRefreshToken();

    user.refreshToken = refreshTokens;
    await user.save({ validateBeforeSave: false });

    return { accessTokens, refreshTokens };
  } catch (error) {
    throw new ApiError("There is an issue in generating token.", 500);
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, role } = req.body;

  const existingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new ApiError("The user already exists", 409);
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
    role,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generaryTemporaryToken(); // make sure method name matches!

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: "Please verify your email.",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  });

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken -isEmailVerified -forgotPasswordToken -forgotPasswordExpiry -emailVerificationToken -emailVerificationExpiry",
  );

  if (!createdUser) {
    throw new ApiError("Something went wrong while registration", 501);
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: createdUser },
        "User created successfully and verification email sent.",
      ),
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;

  if ((!email && !username) || !password) {
    throw new ApiError("Username or email and password is required.", 400);
  }

  // Find user by email OR username
  const user = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!user) {
    throw new ApiError("The user does not exist", 404);
  }

  const passwordMatch = await user.isPasswordCorrect(password);
  if (!passwordMatch) {
    throw new ApiError("The credentials are invalid, please retry.", 404);
  }

  const userRefreshToken = user.generateRefreshToken();
  const userAccessToken = user.generateAccessToken();

  // Save refresh token in DB
  user.refreshToken = userRefreshToken;
  await user.save({ validateBeforeSave: false });

  // Convert to plain object and strip sensitive fields
  const userData = user.toObject();
  delete userData.password;
  delete userData.refreshToken; // also hide refresh token

  // Set cookies
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
          user: userData, // sanitized user object
          accessToken: userAccessToken,
        },
        "Login successful",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully."));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  const user = await User.findById(req.user?._id);

  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if (!isPasswordValid) {
    throw new ApiError("Invalid old password.", 400);
  }

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully."));

  // user.password =
});

const verifyEmail = asyncHandler(async (req, res) => {
  // steps for sending out the email
  // email that are sent during verification that are there.

  const { verificationToken } = req.params;

  if (!verificationToken) {
    throw new ApiError("The email verification token is missing.", 400);
  }
  console.log(verificationToken, "HHHHHHH");
  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationExpiry: {
      $gt: Date.now(),
    },
  });

  if (!user) {
    throw new ApiError("The token is expired or invalid.");
  }

  user.isEmailVerified = true;

  user.emailVerificationExpiry = undefined;
  user.emailVerificationToken = undefined;
  await user.save({ validateBeforeSave: false });

  return res
    .status(200)
    .json(
      new ApiResponse(200, { isEmailVerified: true }, "Email is verified here"),
    );
});
const resendEmailVerification = asyncHandler(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new ApiError("The user not found", 404);
  }

  if (user.isEmailVerified) {
    throw new ApiError("Email is verified", 409);
  }
  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generaryTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: "Resend email verification mail sent.",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`,
    ),
  });

  return res
    .status(201)
    .json(
      new ApiResponse(
        202,
        { email: user.email },
        "User resend email verification send successfully.",
      ),
    );
});
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies?.refreshToken || req?.body?.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError("Unauthorized request", 409);
  }

  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    const user = await User.findById(decodedToken._id);

    if (!user) {
      throw new ApiError("The user is not valid.", 401);
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError("Refresh Token is expired", 401);
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { accessTokens: newAccessToken, refreshTokens: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    user.refreshToken = newRefreshToken;

    await user.save();

    return res
      .status(200)
      .cookie("accessToken", newAccessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, {
          accessTokens: newAccessToken,
          refreshTokens: newRefreshToken,
        }),
      );
  } catch (error) {
    console.log(error, "noor");
    throw new ApiError("Refresh token error", 401);
  }
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({
    email,
  });

  if (!user) {
    throw new ApiError("The user not found.", 404);
  }
  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generaryTemporaryToken(); // make sure method name matches!

  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpirty = tokenExpiry;
  await user.save({ validateBeforeSave: false });

  sendEmail({
    email: user.email,
    subject: "Forgot password email.",
    mailgenContent: emailVerificationMailgenContent(
      user.username,
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unhashedToken}`,
    ),
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user.email,
        "Forgot password url api sent on email.",
      ),
    );
});

const resetForgotPassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;

  const { newPassword } = req.body;

  let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpirty: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError("Token is invalid or expired", 489);
  }

  user.forgotPasswordExpirty = undefined;
  user.forgotPasswordToken = undefined;

  user.password = newPassword;

  await user.save({ validateBeforeSave: false });

  return res
    .status(202)
    .json(new ApiResponse(202, {}, "The user password got update."));
});

export {
  registerUser,
  resetForgotPassword,
  forgotPasswordRequest,
  loginUser,
  changePassword,
  resendEmailVerification,
  logout,
  getCurrentUser,
  verifyEmail,
  refreshAccessToken,
};
