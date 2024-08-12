// eslint-disable-next-line @typescript-eslint/no-unused-vars
import express, { NextFunction, Request, Response} from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globleErrorHandler";
import userRouter from "./user/userRouter";
import bookRouter from "./book/bookRouter";
import cors from "cors";
import { config } from "./config/config";

const app = express();

app.use(cors({
  origin : config.frontendDomain
}));

app.use(express.json());

//Routes
//Http methods : GET, POST, PATCH, PUT, DELETE
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get("/", (req, res, next) => {
  
  const error = createHttpError(400, "Something went to wrong.")

  throw error;

  res.json({ message: "Welcome to elib apis." });
});

//Router
app.use("/api/users/", userRouter);

app.use("/api/books", bookRouter);

//Global error handler
app.use(globalErrorHandler)

export default app;
