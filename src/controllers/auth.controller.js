import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api.error.js";
import { ApiResponse } from "../utils/api.response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { emailVerificationMailgenContent, sendEmail } from "../utils/mail.js";

const generateAccessAndRefreshTokens = async (userId) => {
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
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`,
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

export { registerUser };
