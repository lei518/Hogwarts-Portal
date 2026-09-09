import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { MessageRow, MessageType } from "../services/supabase";
import { messagesRepository } from "../repositories/messagesRepository";
import { useAuth } from "./AuthContext";

// Phase 5 - Owlery. Replaces the old per-character "Owl Post" (a local
// array embedded in one user's own save) with a live inbox backed by the
// `messages` table - mounted once, at the top of main.tsx, so every role
// (not just students) gets one. See CLAUDE.md's Owl Post section, now
// reframed as Owlery under Resources.
interface OwleryContextValue {
  inbox: MessageRow[];
  sent: MessageRow[];
  unreadCount: number;
  loading: boolean;
  send: (input: {
    receiverId: string;
    subject: string;
    content: string;
    messageType: MessageType;
    relatedService?: string;
    relatedId?: string;
  }) => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  refresh: () => void;
}

const OwleryContext = createContext<OwleryContextValue | undefined>(undefined);

export function OwleryProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [inbox, setInbox] = useState<MessageRow[]>([]);
  const [sent, setSent] = useState<MessageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshToken, setRefreshToken] = useState(0);

  useEffect(() => {
    if (!user) {
      setInbox([]);
      setSent([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all([messagesRepository.listInbox(user.id), messagesRepository.listSent(user.id)]).then(
      ([loadedInbox, loadedSent]) => {
        if (cancelled) return;
        setInbox(loadedInbox);
        setSent(loadedSent);
        setLoading(false);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [user, refreshToken]);

  function refresh() {
    setRefreshToken((token) => token + 1);
  }

  async function send(input: {
    receiverId: string;
    subject: string;
    content: string;
    messageType: MessageType;
    relatedService?: string;
    relatedId?: string;
  }) {
    if (!user) return;
    await messagesRepository.send({ ...input, senderId: user.id });
    refresh();
  }

  async function markRead(id: string) {
    if (!inbox.find((m) => m.id === id && m.status === "Sent")) return;
    setInbox((prev) => prev.map((m) => (m.id === id ? { ...m, status: "Read" } : m)));
    await messagesRepository.markRead(id);
  }

  async function markAllRead() {
    if (!user) return;
    setInbox((prev) => prev.map((m) => ({ ...m, status: "Read" })));
    await messagesRepository.markAllRead(user.id);
  }

  const unreadCount = inbox.filter((m) => m.status === "Sent").length;

  return (
    <OwleryContext.Provider value={{ inbox, sent, unreadCount, loading, send, markRead, markAllRead, refresh }}>
      {children}
    </OwleryContext.Provider>
  );
}

export function useOwlery(): OwleryContextValue {
  const context = useContext(OwleryContext);
  if (!context) {
    throw new Error("useOwlery must be used within an OwleryProvider");
  }
  return context;
}
