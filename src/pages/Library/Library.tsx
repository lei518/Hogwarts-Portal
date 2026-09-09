import { useMemo, useState } from "react";
import { BookOpen } from "lucide-react";
import { useGame } from "../../context/GameContext";
import { books, bookCategories, type BookCategory } from "../../data/books";
import { BookCard } from "../../components/library/BookCard";
import { BookDetail } from "../../components/library/BookDetail";
import { PageHeader } from "../../components/ui/PageHeader";
import { Input, Select } from "../../components/ui/Input";
import { EmptyState } from "../../components/ui/EmptyState";

type SortOption = "title" | "knowledge";

export function LibraryPage() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<BookCategory | "All">("All");
  const [sort, setSort] = useState<SortOption>("title");
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = books;

    if (category !== "All") {
      result = result.filter((b) => b.category === category);
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.category.toLowerCase().includes(q)
      );
    }

    return [...result].sort((a, b) =>
      sort === "title"
        ? a.title.localeCompare(b.title)
        : b.knowledgeReward - a.knowledgeReward
    );
  }, [search, category, sort]);

  if (!state.character) return null;

  const selectedBook = books.find((b) => b.id === selectedBookId) ?? null;

  function handleStudy() {
    if (!selectedBook) return;
    dispatch({
      type: "STUDY_BOOK",
      payload: {
        bookId: selectedBook.id,
        knowledgeReward: selectedBook.knowledgeReward,
        unlocksSpellId: selectedBook.unlocksSpellId,
        unlocksLocationId: selectedBook.unlocksLocationId,
      },
    });
  }

  function handleToggleBookmark() {
    if (!selectedBook) return;
    dispatch({ type: "TOGGLE_BOOKMARK", payload: selectedBook.id });
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      <PageHeader title="Hogwarts Library" icon={BookOpen} />

      <div className="flex flex-col sm:flex-row gap-3 my-6">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search books..."
          aria-label="Search books"
          className="flex-1"
        />
        <Select
          value={category}
          onChange={(e) => setCategory(e.target.value as BookCategory | "All")}
        >
          <option value="All">All categories</option>
          {bookCategories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortOption)}>
          <option value="title">Sort: Title</option>
          <option value="knowledge">Sort: Knowledge reward</option>
        </Select>
      </div>

      <p className="text-parchment-dim text-sm mb-4">
        {filtered.length} book{filtered.length !== 1 ? "s" : ""}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map((book) => (
          <BookCard
            key={book.id}
            book={book}
            studied={state.character!.studiedBooks.includes(book.id)}
            bookmarked={state.character!.bookmarkedBooks.includes(book.id)}
            onClick={() => setSelectedBookId(book.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-12">
          <EmptyState message="No books match your search." icon={BookOpen} />
        </div>
      )}

      {selectedBook && (
        <BookDetail
          book={selectedBook}
          studied={state.character.studiedBooks.includes(selectedBook.id)}
          bookmarked={state.character.bookmarkedBooks.includes(selectedBook.id)}
          onStudy={handleStudy}
          onToggleBookmark={handleToggleBookmark}
          onClose={() => setSelectedBookId(null)}
        />
      )}
    </div>
  );
}
