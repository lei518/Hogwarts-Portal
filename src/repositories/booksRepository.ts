import type { BooksRepository } from "./interfaces/repositoryTypes";
import { createBook, listBooks } from "../services/supabase";

// Phase 5 - Library Services. Backed by the live `books` lending catalog -
// distinct from data/books.ts's Resources reading catalog, see
// CLAUDE.md's Library vs. Library Services distinction.
export const booksRepository: BooksRepository = {
  getAll: () => listBooks(),
  create: (input) => createBook(input),
};
