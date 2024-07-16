import express, { NextFunction, Request, Response} from "express";
import createHttpError from "http-errors";
import globalErrorHandler from "./middlewares/globleErrorHandler";

const app = express();

//Routes
//Http methods : GET, POST, PATCH, PUT, DELETE
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.get("/", (req, res, next) => {
  
  const error = createHttpError(400, "Something went to wrong.")

  throw error;

  res.json({ message: "Welcome to elib apis." });
});


//Global error handler
app.use(globalErrorHandler)

export default app;
