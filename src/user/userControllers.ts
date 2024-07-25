import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body);
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required.");
    return next(error);
  }

  try {
    // Check if user exists
    const user = await userModel.findOne({ email });
    if (user) {
      const error = createHttpError(
        400,
        "User already exists with this email."
      );
      return next(error);
    }

    // Password hash
    const hashPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await userModel.create({
      name,
      email,
      password: hashPassword,
    });

    // Token generation - Jwt
    const token = sign(
      { sub: newUser._id.toString() }, // Ensure _id is a string
      config.jwtSecret as string,
      {
        expiresIn : "7d" ,
        algorithm : "HS256"
      }

    );

    // Response
    res
      .status(201)
      .json({ accessToken: token, message: "User Created Successfully" });
  } catch (error) {
    console.error(error);
    next(
      createHttpError(500, "Server error occurred while creating the user.")
    );
  }
};

export { createUser };
