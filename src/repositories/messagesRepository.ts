import type { MessagesRepository } from "./interfaces/repositoryTypes";
import {
  listMessagesForUser,
  markAllMessagesRead,
  markMessageRead,
  sendMessage,
} from "../services/supabase";

// Phase 5 - Owlery. RLS's "view own messages" policy already scopes
// listMessagesForUser() to messages where the caller is the sender or the
// receiver, so inbox/sent are just a client-side split of that one query,
// not two separate reads.
export const messagesRepository: MessagesRepository = {
  listInbox: async (userId) => (await listMessagesForUser()).filter((m) => m.receiverId === userId),
  listSent: async (userId) => (await listMessagesForUser()).filter((m) => m.senderId === userId),
  send: (input) => sendMessage(input),
  markRead: (id) => markMessageRead(id),
  markAllRead: (userId) => markAllMessagesRead(userId),
};
