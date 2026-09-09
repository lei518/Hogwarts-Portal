import { Menu, Landmark, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import { useOwlery } from "../../context/OwleryContext";

interface PortalTopBarProps {
  onMenuClick: () => void;
  /** Bug fix - Owlery is a real cross-account inbox, reachable from every
   * portal (see App.tsx); this is that portal's own path to it, so the
   * mobile top bar carries a working notification icon the same way the
   * Student Portal's Header already does. */
  owleryPath: string;
}

/**
 * Mobile-only top bar for the Professor/Admin/staff portals - carries the
 * nav drawer trigger on small screens, where the desktop Sidebar is
 * hidden, plus the same Owlery notification icon the Student Portal's
 * Header shows (every role has a real inbox, see context/OwleryContext.tsx).
 */
export function PortalTopBar({ onMenuClick, owleryPath }: PortalTopBarProps) {
  const { unreadCount } = useOwlery();

  return (
    <header className="md:hidden sticky top-0 z-10 bg-void/90 backdrop-blur-sm border-b border-parchment-dim/10 px-4 py-2.5 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        aria-label="Open navigation"
        className="flex items-center justify-center w-9 h-9 rounded-full text-parchment-dim hover:text-gold-bright hover:bg-surface transition-colors -ml-1.5"
      >
        <Menu size={19} />
      </button>
      <span className="flex items-center justify-center w-6 h-6 rounded-md border border-gold/30 bg-gold/10 text-gold-bright shrink-0">
        <Landmark size={12} />
      </span>
      <p className="font-display text-parchment text-sm truncate flex-1 min-w-0">Hogwarts Portal</p>
      <Link
        to={owleryPath}
        aria-label={`Owlery${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-parchment-dim hover:text-gold-bright hover:bg-surface transition-colors -mr-1.5 shrink-0"
      >
        <Mail size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] px-1 rounded-full bg-gold-bright text-ink text-[10px] leading-[16px] font-bold text-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Link>
    </header>
  );
}
