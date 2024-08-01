export interface Book {
  _id: string;

  title: string;

  author: User;

  genre: string;

  coverImage: string;

  file: string;

  createeAt: Date;

  updatedAt: Date;
}
