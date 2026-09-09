import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Bird, PenSquare } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useOwlery } from "../../context/OwleryContext";
import { listDirectoryProfiles, type DirectoryProfile, type MessageRow, type MessageType } from "../../services/supabase";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FormField } from "../../components/ui/FormField";
import { Input, Select } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { EmptyState } from "../../components/ui/EmptyState";
import { LoadingState } from "../../components/ui/LoadingState";
import { OwleryMessageCard } from "../../components/owlery/OwleryMessageCard";

const MESSAGE_TYPES: MessageType[] = [
  "Direct Message",
  "Announcement",
  "Assignment Notification",
  "Grade Notification",
  "Service Update",
  "Reminder",
];

const textareaClass =
  "w-full bg-void/40 border border-parchment-dim/25 rounded-md px-3.5 py-2.5 text-sm text-parchment placeholder:text-parchment-dim/50 outline-none transition-colors duration-150 focus:border-gold focus:ring-2 focus:ring-gold/15";

// Phase 5 - Owlery. Replaces the old local-only Owl Post inbox with real
// cross-account messaging (see context/OwleryContext.tsx) - every signed-in
// role (Student, Professor, Admin, and every staff role) reaches this same
// page via their own portal's Mail icon or Owlery nav entry, see App.tsx.
export function OwleryInboxPage() {
  const { user } = useAuth();
  const { inbox, sent, unreadCount, loading, send, markRead, markAllRead } = useOwlery();
  const [tab, setTab] = useState<"inbox" | "sent">("inbox");
  const [directory, setDirectory] = useState<DirectoryProfile[]>([]);
  const [composing, setComposing] = useState(false);
  const [recipientId, setRecipientId] = useState("");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [messageType, setMessageType] = useState<MessageType>("Direct Message");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    listDirectoryProfiles().then(setDirectory);
  }, []);

  const namesById = useMemo(() => {
    const map = new Map<string, string>();
    for (const profile of directory) map.set(profile.userId, profile.displayName);
    return map;
  }, [directory]);

  const recipients = useMemo(
    () => directory.filter((profile) => profile.userId !== user?.id),
    [directory, user]
  );

  const messages = tab === "inbox" ? inbox : sent;

  async function handleSend(event: FormEvent) {
    event.preventDefault();
    if (!recipientId || !subject.trim() || !content.trim()) return;
    setSending(true);
    setError(null);
    try {
      await send({ receiverId: recipientId, subject: subject.trim(), content: content.trim(), messageType });
      setSubject("");
      setContent("");
      setRecipientId("");
      setMessageType("Direct Message");
      setComposing(false);
      setTab("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send this message.");
    } finally {
      setSending(false);
    }
  }

  function handleReply(message: MessageRow) {
    if (!message.senderId) return;
    setRecipientId(message.senderId);
    setSubject(message.subject.startsWith("Re: ") ? message.subject : `Re: ${message.subject}`);
    setContent("");
    setMessageType("Direct Message");
    setComposing(true);
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-3xl mx-auto flex flex-col gap-5">
      <PageHeader
        title="Owlery"
        description={unreadCount > 0 ? `${unreadCount} unread message${unreadCount === 1 ? "" : "s"}.` : "You're all caught up."}
        icon={Bird}
        action={
          <div className="flex items-center gap-2">
            {tab === "inbox" && unreadCount > 0 && (
              <Button variant="secondary" size="sm" onClick={() => markAllRead()}>
                Mark All Read
              </Button>
            )}
            <Button size="sm" onClick={() => setComposing((c) => !c)}>
              <PenSquare size={14} /> Compose
            </Button>
          </div>
        }
      />

      {composing && (
        <Card className="px-5 py-5">
          <form onSubmit={handleSend} className="flex flex-col gap-3">
            <FormField label="To" htmlFor="owlery-recipient">
              <Select
                id="owlery-recipient"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                required
              >
                <option value="">Choose a recipient&hellip;</option>
                {recipients.map((profile) => (
                  <option key={profile.userId} value={profile.userId}>
                    {profile.displayName}
                    {profile.role ? ` (${profile.role})` : ""}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Type" htmlFor="owlery-type">
              <Select
                id="owlery-type"
                value={messageType}
                onChange={(e) => setMessageType(e.target.value as MessageType)}
              >
                {MESSAGE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Subject" htmlFor="owlery-subject">
              <Input
                id="owlery-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </FormField>
            <FormField label="Message" htmlFor="owlery-content">
              <textarea
                id="owlery-content"
                className={`${textareaClass} min-h-[120px]`}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
              />
            </FormField>
            {error && <p className="text-ember text-sm">{error}</p>}
            <div className="flex items-center gap-2">
              <Button type="submit" disabled={sending} size="sm">
                {sending ? "Sending…" : "Send"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setComposing(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="flex gap-2">
        {(["inbox", "sent"] as const).map((option) => (
          <button
            key={option}
            onClick={() => setTab(option)}
            className={`text-xs uppercase tracking-wide px-3 py-1.5 rounded-full border transition-colors ${
              tab === option
                ? "border-gold text-gold-bright bg-gold/10"
                : "border-parchment-dim/25 text-parchment-dim hover:border-gold/50"
            }`}
          >
            {option === "inbox" ? "Inbox" : "Sent"}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingState label="Loading messages…" />
      ) : messages.length === 0 ? (
        <EmptyState
          message={tab === "inbox" ? "No messages yet. Owls will deliver your letters here." : "You haven't sent any messages yet."}
          icon={Bird}
        />
      ) : (
        <div className="flex flex-col gap-2">
          {messages.map((message) => (
            <OwleryMessageCard
              key={message.id}
              message={message}
              counterpartyLabel={tab === "inbox" ? "From" : "To"}
              counterpartyName={
                tab === "inbox"
                  ? (message.senderId && namesById.get(message.senderId)) || "Hogwarts Staff"
                  : namesById.get(message.receiverId) || "Unknown"
              }
              onOpen={(id) => markRead(id)}
              onReply={tab === "inbox" ? handleReply : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
