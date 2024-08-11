import path from "node:path";
import express from "express";
import { createBook, deleteBook, getSingleBook, listBooks, updateBook } from "./bookController";
import multer from "multer";
import authenticate from "../middlewares/authenticate";

const bookRouter = express.Router();

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, //30mb   30*1024*1024
});

//routes
// /api/books
bookRouter.post(
  "/",
  authenticate,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "file",
    },
  ]),
  createBook
);

//update book api
// /api/books/:id

bookRouter.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    {
      name: "coverImage",
      maxCount: 1,
    },
    {
      name: "file",
    },
  ]),
  updateBook
);

//get all books
// /api/books
bookRouter.get("/", listBooks);

//get single book
// /api/books/:id
bookRouter.get("/:bookId", getSingleBook);

//delete single book
// /api/books/:id
bookRouter.delete("/:bookId", authenticate, deleteBook);

export default bookRouter;
