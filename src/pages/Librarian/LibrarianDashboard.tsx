import { useEffect, useMemo, useState, type FormEvent } from "react";
import { BookCopy, BookPlus, Undo2 } from "lucide-react";
import { booksRepository } from "../../repositories/booksRepository";
import { loansRepository } from "../../repositories/loansRepository";
import { useAssignedStaffName } from "../../utils/serviceAssignments";
import { listDirectoryProfiles, type BookLoanRow, type BookRow, type DirectoryProfile } from "../../services/supabase";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { ProfileSection } from "../../components/character/ProfileSection";
import { SchoolAnnouncementsPreview } from "../../components/announcements/SchoolAnnouncementsPreview";

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

// Phase 5 - Campus Services. Librarian Portal: manage the lending catalog
// (books) and process loans (book_loans) - one combined dashboard, per the
// plan's minimal one-page-per-role scope.
export function LibrarianDashboardPage() {
  const { name: managedByName } = useAssignedStaffName("Library");
  const [books, setBooks] = useState<BookRow[]>([]);
  const [loans, setLoans] = useState<BookLoanRow[]>([]);
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [totalCopies, setTotalCopies] = useState("1");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [returningId, setReturningId] = useState<string | null>(null);

  function loadAll() {
    setLoading(true);
    Promise.all([booksRepository.getAll(), loansRepository.getAll(), listDirectoryProfiles()]).then(
      ([loadedBooks, loadedLoans, loadedDirectory]) => {
        setBooks(loadedBooks);
        setLoans(loadedLoans);
        setDirectory(loadedDirectory);
        setLoading(false);
      }
    );
  }

  useEffect(loadAll, []);

  const booksById = useMemo(() => new Map(books.map((b) => [b.id, b])), [books]);
  const namesById = useMemo(() => new Map(directory.map((p) => [p.userId, p.displayName])), [directory]);
  const activeLoans = loans.filter((l) => l.status !== "Returned").sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  async function handleAddBook(event: FormEvent) {
    event.preventDefault();
    const copies = Number(totalCopies);
    if (!title.trim() || !author.trim() || !category.trim() || Number.isNaN(copies) || copies < 1) return;
    setAdding(true);
    setError(null);
    try {
      await booksRepository.create({
        title: title.trim(),
        author: author.trim(),
        category: category.trim(),
        description: description.trim(),
        totalCopies: copies,
      });
      setTitle("");
      setAuthor("");
      setCategory("");
      setDescription("");
      setTotalCopies("1");
      loadAll();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add this book.");
    } finally {
      setAdding(false);
    }
  }

  async function handleReturn(loanId: string) {
    setReturningId(loanId);
    try {
      await loansRepository.return(loanId);
      loadAll();
    } finally {
      setReturningId(null);
    }
  }

  if (loading) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto">
        <LoadingState label="Loading the library…" />
      </div>
    );
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader title="Librarian Dashboard" description="Manage the catalog and process loans." icon={BookCopy} />
      <p className="text-parchment-dim text-xs -mt-3">Managed by: {managedByName}</p>

      <SchoolAnnouncementsPreview />

      <ProfileSection title="Active Loans">
        {activeLoans.length === 0 ? (
          <p className="text-parchment-dim text-sm">No books are currently on loan.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {activeLoans.map((loan) => (
              <div key={loan.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-parchment text-sm truncate">
                    {booksById.get(loan.bookId)?.title ?? "Unknown Book"}
                  </p>
                  <p className="text-parchment-dim text-xs">
                    {namesById.get(loan.studentId) ?? "Unknown Student"} &middot; Due {formatDate(loan.dueDate)}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={returningId === loan.id}
                  onClick={() => handleReturn(loan.id)}
                >
                  <Undo2 size={13} /> Mark Returned
                </Button>
              </div>
            ))}
          </div>
        )}
      </ProfileSection>

      <ProfileSection title="Catalog" icon={BookCopy}>
        {books.length === 0 ? (
          <EmptyState message="No books in the catalog yet." icon={BookCopy} />
        ) : (
          <div className="flex flex-col gap-2">
            {books.map((book) => (
              <div key={book.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-parchment text-sm truncate">{book.title}</p>
                  <p className="text-parchment-dim text-xs">
                    {book.author} &middot; {book.category}
                  </p>
                </div>
                <span className="text-parchment-dim text-xs shrink-0">
                  {book.availableCopies}/{book.totalCopies} available
                </span>
              </div>
            ))}
          </div>
        )}
      </ProfileSection>

      <Card className="px-5 py-5">
        <h2 className="font-display text-parchment text-lg mb-4 flex items-center gap-2">
          <BookPlus size={17} className="text-gold-bright" /> Add a Book
        </h2>
        <form onSubmit={handleAddBook} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField label="Title" htmlFor="book-title">
              <Input id="book-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </FormField>
            <FormField label="Author" htmlFor="book-author">
              <Input id="book-author" value={author} onChange={(e) => setAuthor(e.target.value)} required />
            </FormField>
            <FormField label="Category" htmlFor="book-category">
              <Input id="book-category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </FormField>
            <FormField label="Copies" htmlFor="book-copies">
              <Input
                id="book-copies"
                type="number"
                min={1}
                value={totalCopies}
                onChange={(e) => setTotalCopies(e.target.value)}
                required
              />
            </FormField>
          </div>
          <FormField label="Description" htmlFor="book-description">
            <Input id="book-description" value={description} onChange={(e) => setDescription(e.target.value)} />
          </FormField>
          {error && <p className="text-ember text-sm">{error}</p>}
          <Button type="submit" size="sm" disabled={adding} className="self-start">
            {adding ? "Adding…" : "Add Book"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
