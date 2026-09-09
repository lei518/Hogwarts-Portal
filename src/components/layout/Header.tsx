import { Link } from "react-router-dom";
import { Mail, Menu } from "lucide-react";
import { useOwlery } from "../../context/OwleryContext";

interface HeaderProps {
  /** Opens the mobile nav drawer - the hamburger only renders when this is provided. */
  onMenuClick?: () => void;
}

// Global chrome, not part of the sectioned navigation model - today it only
// holds the Owlery icon and (on mobile) the nav drawer trigger, but it's
// the one place future global affordances (notifications, account menu,
// ...) would go without touching Sidebar or the mobile drawer.
export function Header({ onMenuClick }: HeaderProps) {
  const { unreadCount } = useOwlery();

  return (
    <header className="sticky top-0 z-10 bg-void/90 backdrop-blur-sm border-b border-parchment-dim/10 px-4 md:px-8 py-2.5 flex items-center justify-between">
      {onMenuClick ? (
        <button
          onClick={onMenuClick}
          aria-label="Open navigation"
          className="md:hidden flex items-center justify-center w-9 h-9 rounded-full text-parchment-dim hover:text-gold-bright hover:bg-surface transition-colors"
        >
          <Menu size={19} />
        </button>
      ) : (
        <span />
      )}
      <Link
        to="/owlery"
        aria-label={`Owlery${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        className="relative flex items-center justify-center w-9 h-9 rounded-full text-parchment-dim hover:text-gold-bright hover:bg-surface transition-colors"
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
