import { useOwlery } from "../../../context/OwleryContext";
import { MessageTypeBadge } from "../../owlery/MessageTypeBadge";
import { DashboardWidget } from "../DashboardWidget";

// Shows only the single latest message - the Owlery inbox (/owlery) owns
// the full history, this is a preview only (see CLAUDE.md: Home previews,
// it doesn't own).
export function RecentOwleryWidget() {
  const { inbox } = useOwlery();
  const latest = inbox[0];

  return (
    <DashboardWidget title="Recent Owlery" to="/owlery" actionLabel="Open Inbox">
      {latest ? (
        <>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-parchment text-sm truncate">{latest.subject}</p>
            <MessageTypeBadge type={latest.messageType} />
          </div>
          <p className="text-parchment-dim text-xs truncate">{latest.content}</p>
        </>
      ) : (
        <p className="text-parchment-dim text-sm">
          No post has arrived yet. Owls will deliver your letters here.
        </p>
      )}
    </DashboardWidget>
  );
}
