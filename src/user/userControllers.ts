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

export { createUser };
