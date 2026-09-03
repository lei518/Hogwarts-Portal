import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useGame } from "../../context/GameContext";

// Global chrome, not part of the sectioned navigation model - today it only
// holds the Owl Post icon, but it's the one place future global affordances
// (notifications, account menu, ...) would go without touching Sidebar or
// BottomNav.
export function Header() {
  const { state } = useGame();
  const unreadCount = state.character?.owlPost.filter((m) => !m.read).length ?? 0;

  return (
    <header className="sticky top-0 z-10 bg-void/90 backdrop-blur-sm border-b border-parchment-dim/10 px-4 md:px-8 py-2.5 flex items-center justify-end">
      <Link
        to="/owl-post"
        aria-label={`Owl Post${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-parchment-dim hover:text-gold-bright hover:bg-parchment-dim/5 transition-colors"
      >
        <Mail size={19} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-gold-bright text-ink text-[10px] leading-[16px] font-bold text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
