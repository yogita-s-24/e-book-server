import mongoose from "mongoose";
import { User } from "./userTypes";

const userShema = mongoose.Schema<User>(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timeStamp: true }
);

export default mongoose.model<User>("User", userShema);
