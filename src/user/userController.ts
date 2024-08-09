import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required.");
    return next(error);
  }

  // Check if user exists
  try {
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(
        400,
        "User already exists with this email."
      );
      return next(error);
    }
  } catch (error) {
    return next(createHttpError(500, "Error while getting user."));
  }

  let newUser: User;
  try {
    // Password hash
    const hashPassword = await bcrypt.hash(password, 10);
    // Create new user
    newUser = await userModel.create({
      name,
      email,
      password: hashPassword,
    });
  } catch (error) {
    return next(createHttpError(500, "Error while creating user."));
  }

  try {
    // Token generation - Jwt
    const token = sign(
      { sub: newUser._id.toString() }, // Ensure _id is a string
      config.jwtSecret as string,
      {
        expiresIn: "7d",
        algorithm: "HS256",
      }
    );
    // Response
    res
      .status(201)
      .json({ accessToken: token, message: "User Created Successfully" });
  } catch (error) {
    return next(createHttpError(500, "Error while signing JWT token."));
  }
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(createHttpError(400, "All fields are required."));
  }

  let user;

  try {
    user = await userModel.findOne({ email });
  } catch (error) {
    return next(createHttpError(500, "Error while login the user."));
  }

  if (!user) {
    return next(createHttpError(404, "User not found."));
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    return next(createHttpError(400, "Username or password incorrect!"));
  }

  //created access token

  try {
    const token = sign(
      { sub: user._id }, // Ensure _id is a string

      config.jwtSecret as string,
      {
        expiresIn: "7d",

        algorithm: "HS256",
      }
    );

    res.json({ accessToken: token });
  } catch (error) {
    return next(createHttpError(500, "Error while login the user."));
  }
};

export { createUser, loginUser };
