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

  const files = req.files as { [filename: string]: Express.Multer.File[] };

  const coverImageMimeType = files.coverImage[0].mimetype.split("/").at(-1);

  const fileName = files.coverImage[0].filename;

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

export { createBook };
