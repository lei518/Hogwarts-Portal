import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { BookCopy, Search } from "lucide-react";
import { libraryServicesService, readingRooms } from "../../data/libraryServices";
import { booksRepository } from "../../repositories/booksRepository";
import { loansRepository } from "../../repositories/loansRepository";
import { useAuth } from "../../context/AuthContext";
import { useAssignedStaffName } from "../../utils/serviceAssignments";
import type { BookLoanRow, BookRow } from "../../services/supabase";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection } from "../../components/character/ProfileSection";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { LoadingState } from "../../components/ui/LoadingState";

const ROOM_AVAILABILITY_COLORS: Record<string, string> = {
  Open: "#6b9e6b",
  Full: "#c77b7b",
  Reserved: "#c9a646",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 5 - Campus Services. Replaces the old static Borrowed/Reserved
// seed lists with a real borrow/return workflow backed by the live
// `books`/`book_loans` tables (see CLAUDE.md's Library vs. Library
// Services distinction - `/library` itself is untouched).
export function LibraryServicesPage() {
  const { user } = useAuth();
  const { name: managedByName } = useAssignedStaffName("Library");
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loans, setLoans] = useState<BookLoanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [borrowingId, setBorrowingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([booksRepository.getAll(), loansRepository.getAll()]).then(([loadedBooks, loadedLoans]) => {
      setBooks(loadedBooks);
      setLoans(loadedLoans);
      setLoading(false);
    });
  }

  useEffect(loadAll, []);

  const myLoans = useMemo(
    () => loans.filter((loan) => loan.studentId === user?.id && loan.status !== "Returned"),
    [loans, user]
  );

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (book) => book.title.toLowerCase().includes(q) || book.author.toLowerCase().includes(q) || book.category.toLowerCase().includes(q)
    );
  }, [books, query]);

  async function handleBorrow(bookId: string) {
    if (!user) return;
    setBorrowingId(bookId);
    setError(null);
    try {
      await loansRepository.borrow(bookId, user.id);
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not borrow this book.");
    } finally {
      setBorrowingId(null);
    }
  }

  async function handleReturn(loanId: string) {
    setBorrowingId(loanId);
    try {
      await loansRepository.return(loanId);
      loadAll();
    } finally {
      setBorrowingId(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading Library Services…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={libraryServicesService} />
      <p className="text-parchment-dim text-xs -mt-3">Managed by: {managedByName}</p>
      <p className="text-parchment-dim text-xs -mt-3">
        Looking for a book to read? Visit the <Link to="/library" className="text-gold hover:text-gold-bright">Library</Link>.
      </p>

      <ProfileSection title="My Loans">
        {myLoans.length === 0 ? (
          <p className="text-parchment-dim text-sm">You have no books currently on loan.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {myLoans.map((loan) => {
              const book = books.find((b) => b.id === loan.bookId);
              return (
                <div key={loan.id} className="flex items-center justify-between gap-3">
                  <p className="text-parchment text-sm truncate">{book?.title ?? "Unknown Book"}</p>
                  <div className="flex items-center gap-3 shrink-0">
                    <p className="text-xs" style={{ color: loan.status === "Overdue" ? "#c77b7b" : undefined }}>
                      Due {formatDate(loan.dueDate)}
                    </p>
                    <Button size="sm" variant="secondary" disabled={borrowingId === loan.id} onClick={() => handleReturn(loan.id)}>
                      Return
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ProfileSection>

      <ProfileSection title="Catalog" icon={BookCopy}>
        <div className="relative mb-4">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-parchment-dim/60" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, author, or category…"
            className="pl-9"
          />
        </div>
        {error && <p className="text-ember text-sm mb-3">{error}</p>}
        {filteredBooks.length === 0 ? (
          <p className="text-parchment-dim text-sm">No books match your search.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredBooks.map((book) => {
              const alreadyBorrowed = myLoans.some((loan) => loan.bookId === book.id);
              return (
                <div key={book.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-parchment text-sm truncate">{book.title}</p>
                    <p className="text-parchment-dim text-xs">
                      {book.author} &middot; {book.category} &middot; {book.availableCopies}/{book.totalCopies} available
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={alreadyBorrowed || book.availableCopies < 1 || borrowingId === book.id}
                    onClick={() => handleBorrow(book.id)}
                  >
                    {alreadyBorrowed ? "Borrowed" : book.availableCopies < 1 ? "Unavailable" : "Borrow"}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </ProfileSection>

      <ProfileSection title="Reading Rooms">
        <div className="flex flex-col gap-2">
          {readingRooms.map((room) => (
            <div key={room.id} className="flex items-center justify-between gap-3">
              <p className="text-parchment text-sm">{room.name}</p>
              <span
                className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border"
                style={{
                  color: ROOM_AVAILABILITY_COLORS[room.availability],
                  borderColor: `${ROOM_AVAILABILITY_COLORS[room.availability]}66`,
                  background: `${ROOM_AVAILABILITY_COLORS[room.availability]}15`,
                }}
              >
                {room.availability}
              </span>
            </div>
          ))}
        </div>
      </ProfileSection>
    </div>
  );
}
