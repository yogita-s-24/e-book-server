import { Request, Response, NextFunction } from "express";

import cloudinary from "../config/cloudinary";

import path from "node:path";

import createHttpError from "http-errors";

import bookModel from "./bookModel";

import fs from "node:fs";

import { AuthRequest } from "../middlewares/authenticate";

const createBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;

  // console.log("files", req.files);

  const files = req?.files as { [filename: string]: Express.Multer.File[] };

  if (!files || !files.coverImage || !files.coverImage[0]) {
    return next(createHttpError(400, "Missing cover image"));
  } 

  if (!files || !files.file || !files.file[0]) {
    return next(createHttpError(400, "Missing book PDF"));
  }

  const coverImageMimeType = files?.coverImage[0]?.mimetype?.split("/")?.at(-1);

  if(!coverImageMimeType){
    const error = "Please select cover image"
    return next(error);
  }


  
  const fileName = files?.coverImage[0]?.filename;

  const coverImageFilePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    fileName
  );

  try {
    const uploadResult = await cloudinary.uploader.upload(coverImageFilePath, {
      filename_override: fileName,

      folder: "book-covers",

      format: coverImageMimeType,
    });

    // console.log({
    //   filename_override: fileName,

    //   folder: "book-covers",

    //   format: coverImageMimeType,
    // });

    const bookFileName = files.file[0].filename;

    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads",
      bookFileName
    );

    try {
      const bookFileUploadResult = await cloudinary.uploader.upload(
        bookFilePath,
        {
          resource_type: "raw",
          filename_override: bookFileName,
          folder: "book-pdfs",
          format: "pdf",
        }
      );

      const _req = req as AuthRequest;

      const newBook = await bookModel.create({
        title,
        genre,
        author: _req.userId,
        coverImage: uploadResult.secure_url,
        file: bookFileUploadResult.secure_url,
      });

      console.log(newBook);

      //delete temp file
      await fs.promises.unlink(coverImageFilePath);
      await fs.promises.unlink(bookFilePath);

      res.status(201).json({
        message: "Book created successfully",
        data: newBook._id,
      });
    } catch (error) {
      console.log(error);
      return next(createHttpError(500, "Error while uploading the file."));
    }

    res.json();
  } catch (error) {
    // console.log(error);
    return next(createHttpError(500, "Error occured to to create a folder."));
  }
};

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  // Check access
  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You can not update others book."));
  }

  // check if image field is exists.

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    // send files to cloudinary
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    completeCoverImage = filename;

    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "book-pdfs",
      format: converMimeType,
    });

    completeCoverImage = uploadResult.secure_url;

    await fs.promises.unlink(filePath);
  }

  // check if file field is exists.
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-covers",
      format: "pdf",
    });

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
    },
    { new: true }
  );

  res.json(updatedBook);
};

const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await bookModel.find().populate("author", "name");

    res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error while getting all books"));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModel.findOne({ _id: bookId }).populate("author", "name");

    if (!book) {
      return next(createHttpError(500, "Book not found."));
    }

    return res.json(book);
  } catch (error) {
    return next(createHttpError(500, "Error create while getting a book."));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found."));
  }

  //check access

  const _req = req as AuthRequest;

  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "You cannot update other book."));
  }

  //book-covers/bq7wk4bkqyrtr0edcqyg
  //https://res.cloudinary.com/duw8vkbru/image/upload/v1722934925/book-covers/ojducuqhkfmkzd51o97t.png

  const coverFileSplits = book.coverImage.split("/");

  const coverImagePublicId =
    coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

  const bookFileSplits = book.file.split("/");

  const bookImagePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);

  console.log("bookImagePublicId", bookImagePublicId);

  await cloudinary.uploader.destroy(coverImagePublicId);

  await cloudinary.uploader.destroy(bookImagePublicId, {
    resource_type: "raw",
  });

  await bookModel.deleteOne({ _id: bookId });

  return res.sendStatus(204);
};

export { createBook, updateBook, listBooks, getSingleBook, deleteBook };
