import { Bookmark } from "lucide-react";
import type { Book } from "../../data/books";

interface BookCardProps {
  book: Book;
  studied: boolean;
  bookmarked: boolean;
  onClick: () => void;
}

export function BookCard({ book, studied, bookmarked, onClick }: BookCardProps) {
  return (
    <button
      onClick={onClick}
      className={`text-left border rounded-sm p-4 transition-colors duration-150 relative ${
        studied
          ? "border-gold/40 bg-gold/5"
          : "border-parchment-dim/25 hover:border-parchment-dim/60 bg-void/30"
      }`}
    >
      {bookmarked && (
        <Bookmark size={14} className="absolute top-3 right-3 fill-gold text-gold" />
      )}
      <p className="text-xs uppercase tracking-wide text-parchment-dim mb-1">{book.category}</p>
      <h3 className="font-display text-lg text-parchment pr-4">📖 {book.title}</h3>
      <p className="text-parchment-dim text-sm mt-1 leading-relaxed line-clamp-2">
        {book.description}
      </p>
      <div className="flex items-center justify-between mt-3 text-xs">
        <span className="text-parchment-dim">+{book.knowledgeReward} Knowledge</span>
        {studied && <span className="text-gold-bright">Studied ✓</span>}
      </div>
    </button>
  );
}
