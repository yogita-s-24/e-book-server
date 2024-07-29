 import express from 'express';
import { createBook } from './bookController';

const bookRouter = express.Router();

//routes
 
bookRouter.post("/", createBook);

bookRouter.post("/", )


export default bookRouter;