import { Link } from "react-router-dom";
import { BookmarkPlus, RefreshCw } from "lucide-react";
import {
  libraryServicesService,
  borrowedBooks,
  reservedBooks,
  readingRooms,
} from "../../data/libraryServices";
import { ServiceHeader } from "../../components/studentServices/ServiceHeader";
import { ProfileSection } from "../../components/character/ProfileSection";

const ROOM_AVAILABILITY_COLORS: Record<string, string> = {
  Open: "#6b9e6b",
  Full: "#c77b7b",
  Reserved: "#c9a646",
};

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function LibraryServicesPage() {
  const overdueBooks = borrowedBooks.filter((book) => book.status === "Overdue");

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <ServiceHeader service={libraryServicesService} />
      <p className="text-parchment-dim text-xs -mt-3">
        Looking for a book to read? Visit the <Link to="/library" className="text-gold hover:text-gold-bright">Library</Link>.
      </p>

      <ProfileSection title="Borrowed Books">
        {borrowedBooks.length === 0 ? (
          <p className="text-parchment-dim text-sm">You have no books currently on loan.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {borrowedBooks.map((book) => (
              <div key={book.id} className="flex items-center justify-between gap-3">
                <p className="text-parchment text-sm">{book.title}</p>
                <p
                  className="text-xs shrink-0"
                  style={{ color: book.status === "Overdue" ? "#c77b7b" : undefined }}
                >
                  Due {formatDate(book.dueDate)}
                </p>
              </div>
            ))}
          </div>
        )}
      </ProfileSection>

      {overdueBooks.length > 0 && (
        <ProfileSection title="Overdue Notices">
          <div className="flex flex-col gap-1.5">
            {overdueBooks.map((book) => (
              <p key={book.id} className="text-sm" style={{ color: "#c77b7b" }}>
                "{book.title}" was due {formatDate(book.dueDate)}.
              </p>
            ))}
          </div>
        </ProfileSection>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Reserved Books">
          {reservedBooks.length === 0 ? (
            <p className="text-parchment-dim text-sm">No active reservations.</p>
          ) : (
            <div className="flex flex-col gap-1.5">
              {reservedBooks.map((book) => (
                <p key={book.id} className="text-parchment text-sm">
                  {book.title}
                </p>
              ))}
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ProfileSection title="Borrow Requests" icon={BookmarkPlus}>
          <p className="text-parchment-dim text-sm">Requesting a new loan isn't available yet.</p>
        </ProfileSection>
        <ProfileSection title="Renew Loan" icon={RefreshCw}>
          <p className="text-parchment-dim text-sm">Renewing a loan isn't available yet.</p>
        </ProfileSection>
      </div>
    </div>
  );
}
