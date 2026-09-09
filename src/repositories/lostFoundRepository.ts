import type { LostFoundRepository } from "./interfaces/repositoryTypes";
import { listLostFoundItems, reportLostItem, updateLostFoundStatus } from "../services/supabase";

// Phase 5 - Lost & Found. Backed by the live `lost_found_items` table -
// readable/updatable by any signed-in user (low-stakes content, see the
// migration's own note), so getAll() returns every item for every role.
export const lostFoundRepository: LostFoundRepository = {
  getAll: () => listLostFoundItems(),
  report: (input) => reportLostItem(input),
  updateStatus: (id, status, claimedBy) => updateLostFoundStatus(id, status, claimedBy),
};
