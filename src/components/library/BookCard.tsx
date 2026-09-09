import { Bookmark, BookOpen, Check } from "lucide-react";
import type { Book } from "../../data/books";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";

interface BookCardProps {
  book: Book;
  studied: boolean;
  bookmarked: boolean;
  onClick: () => void;
}

export function BookCard({ book, studied, bookmarked, onClick }: BookCardProps) {
  return (
    <button onClick={onClick} className="text-left">
      <Card
        interactive
        className={`p-4 relative ${studied ? "border-gold/40 bg-gold/5" : ""}`}
      >
        {bookmarked && (
          <Bookmark size={14} className="absolute top-3 right-3 fill-gold text-gold" />
        )}
        <p className="text-xs uppercase tracking-wide text-parchment-dim mb-1">{book.category}</p>
        <h3 className="flex items-center gap-2 font-display text-lg text-parchment pr-4">
          <BookOpen size={16} className="text-gold/70 shrink-0" />
          {book.title}
        </h3>
        <p className="text-parchment-dim text-sm mt-1 leading-relaxed line-clamp-2">
          {book.description}
        </p>
        <div className="flex items-center justify-between mt-3 text-xs">
          <span className="text-parchment-dim">+{book.knowledgeReward} Knowledge</span>
          {studied && (
            <Badge tone="gold" className="gap-1">
              <Check size={11} /> Studied
            </Badge>
          )}
        </div>
      </Card>
    </button>
  );
}
