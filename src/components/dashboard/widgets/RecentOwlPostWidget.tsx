import { useGame } from "../../../context/GameContext";
import { CategoryBadge } from "../../owlPost/CategoryBadge";
import { DashboardWidget } from "../DashboardWidget";

// Shows only the single latest message - the Inbox (/owl-post) owns the
// full history, this is a preview only (see CLAUDE.md: Home previews, it
// doesn't own).
export function RecentOwlPostWidget() {
  const { state } = useGame();
  const character = state.character;

  const latest = character?.owlPost[0];

  return (
    <DashboardWidget title="Recent Owl Post" to="/owl-post" actionLabel="Open Inbox">
      {latest ? (
        <>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-parchment text-sm truncate">{latest.subject}</p>
            <CategoryBadge category={latest.category} />
          </div>
          <p className="text-parchment-dim text-xs truncate">{latest.sender}</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">
          🦉 No post has arrived yet. Owls will deliver your letters here.
        </p>
      )}
    </DashboardWidget>
  );
}
