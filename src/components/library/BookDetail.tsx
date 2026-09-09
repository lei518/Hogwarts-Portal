import { Bookmark, X, BookOpen, Check } from "lucide-react";
import type { Book } from "../../data/books";
import { Button } from "../ui/Button";
import { getLocation } from "../../data/locations";
import { spells } from "../../data/spells";

interface BookDetailProps {
  book: Book;
  studied: boolean;
  bookmarked: boolean;
  onStudy: () => void;
  onToggleBookmark: () => void;
  onClose: () => void;
}

export function BookDetail({
  book,
  studied,
  bookmarked,
  onStudy,
  onToggleBookmark,
  onClose,
}: BookDetailProps) {
  const unlockedSpell = book.unlocksSpellId ? spells.find((s) => s.id === book.unlocksSpellId) : null;
  const unlockedLocation = book.unlocksLocationId ? getLocation(book.unlocksLocationId) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-void/85 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label={book.title}
    >
      <div className="relative w-full max-w-md border border-gold/30 rounded-lg bg-surface shadow-xl shadow-black/40 p-8">
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-parchment-dim hover:text-gold"
        >
          <X size={18} />
        </button>

        <p className="text-xs uppercase tracking-wide text-parchment-dim mb-2">{book.category}</p>
        <h2 className="flex items-center gap-2 text-2xl font-display text-gold-bright mb-3">
          <BookOpen size={20} className="text-gold/70 shrink-0" />
          {book.title}
        </h2>
        <p className="text-parchment-dim text-sm leading-relaxed mb-5">{book.description}</p>

        <div className="flex flex-col gap-2 text-sm mb-6">
          <Row label="Knowledge" value={`+${book.knowledgeReward}`} />
          {unlockedSpell && <Row label="Unlocks Spell" value={unlockedSpell.name} />}
          {unlockedLocation && <Row label="Reveals Location" value={unlockedLocation.name} />}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={onStudy}
            disabled={studied}
            className="flex-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {studied ? (
              <span className="flex items-center justify-center gap-1.5">
                <Check size={15} /> Studied
              </span>
            ) : (
              "Study"
            )}
          </Button>
          <Button variant="secondary" onClick={onToggleBookmark} className="px-4">
            <Bookmark size={16} className={bookmarked ? "fill-gold text-gold" : ""} />
          </Button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-parchment-dim/10 pb-2">
      <span className="text-parchment-dim">{label}</span>
      <span className="text-parchment">{value}</span>
    </div>
  );
}
