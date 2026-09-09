import type { LoansRepository } from "./interfaces/repositoryTypes";
import { borrowBook, listBookLoans, returnBookLoan } from "../services/supabase";

// Phase 5 - Library Services. Backed by the live `book_loans` table; a
// security-definer trigger keeps `books.available_copies` in sync on
// borrow/return (see the migration's own comment) - nothing extra to do here.
export const loansRepository: LoansRepository = {
  getAll: () => listBookLoans(),
  borrow: (bookId, studentId) => borrowBook(bookId, studentId),
  return: (id) => returnBookLoan(id),
};
