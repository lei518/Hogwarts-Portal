import type { LibraryRepository } from "./interfaces/repositoryTypes";
import { books, getBook } from "../data/books";

// No synchronous consumer - same status as announcementsRepository.ts.
export const libraryRepository: LibraryRepository = {
  getAll: async () => books,
  getById: async (id) => getBook(id),
};
