import {
  createContext,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
} from "react";
import type { GameSettings, GameState, House, InventoryItem } from "../types/game";
import { DEFAULT_SETTINGS } from "../types/game";
import type { Character } from "../types/character";
import type { OwlPostCategory, OwlPostMessage } from "../types/owlPost";
import type { HousePointAward, PersonalNote, Reminder } from "../types/campusLife";
import type { AssignmentSubmission } from "../types/academics";
import { loadGameState, saveGameState, clearGameState } from "../utils/storage";
import { awardXp, clamp } from "../utils/xpSystem";
import { getUnlockedAchievementIds } from "../data/achievements";
import { owlPostSeeds } from "../data/owlPostSeeds";
import { getAssignment } from "../data/assignments";
import { useAuth } from "./AuthContext";
import { fetchCloudSave, upsertCloudSave } from "../services/supabase";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export type SyncStatus = "idle" | "saving" | "saved" | "offline";

const CLOUD_PUSH_DEBOUNCE_MS = 2500;

const initialState: GameState = {
  character: null,
  settings: DEFAULT_SETTINGS,
};

// Phase 3D - Grade Management Bridge. The sole write path for a
// Professor-reviewed grade to reach the Student Portal's own
// AssignmentSubmission - dispatched only by bridges/GradeBridgeSync.tsx,
// only after it has confirmed (by exact name match, its one and only
// correspondence rule) that a StudentSubmission belongs to the signed-in
// Character. This action does not know or care where `grade` came from.
interface ApplyProfessorGradePayload {
  assignmentId: string;
  grade: number;
}

interface CastSpellPayload {
  spellId: string;
  manaCost: number;
  xpAward: number;
  masteryGain: number;
  success: boolean;
}

interface BrewPotionPayload {
  potionId: string;
  potionName: string;
  xpAward: number;
  masteryGain: number;
  yieldsPotion: boolean;
  housePointsDelta: number;
}

interface UseItemPayload {
  itemId: string;
  healthDelta?: number;
  energyDelta?: number;
  knowledgeDelta?: number;
}

interface StudyBookPayload {
  bookId: string;
  knowledgeReward: number;
  unlocksSpellId?: string;
  unlocksLocationId?: string;
}

interface ChangeRelationshipPayload {
  studentId: string;
  delta: number;
}

// The single publish API for Owl Post - any feature (Academics, House Cup,
// Student Planner, Announcements, ...) sends a message with this shape.
// `id`/`timestamp` are optional because most callers don't need to name
// them; the seeding effect below supplies a stable `id` so a seed is never
// sent twice for the same character.
interface SendOwlPostPayload {
  id?: string;
  category: OwlPostCategory;
  sender: string;
  subject: string;
  body: string;
  timestamp?: string;
}

// The single publish API for House Points, mirroring SEND_OWL_POST_MESSAGE -
// any feature (Potions, an adventure, Quidditch, a professor, an assignment
// grade, an automated system) awards or deducts points this same way, and
// House Cup never needs to change to pick up a new source. `awardedBy` is
// deliberately free text, not a closed union, so a future source can name
// itself without a type change here.
interface AwardHousePointsPayload {
  id?: string;
  house: House;
  amount: number;
  reason: string;
  awardedBy: string;
  timestamp?: string;
}

interface AdventureRewardPayload {
  questId: string;
  questTitle: string;
  questDescription: string;
  xp?: number;
  housePoints?: number;
  knowledge?: number;
  relationshipChanges?: { studentId: string; delta: number }[];
  inventoryItem?: { name: string; category: InventoryItem["category"]; quantity: number };
  unlocksSpellId?: string;
  unlocksLocationId?: string;
}

type GameAction =
  | { type: "CREATE_CHARACTER"; payload: Character }
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "COMPLETE_COMMON_ROOM_INTRO"; payload: { startingHousePoints: number } }
  | { type: "DISCOVER_LOCATION"; payload: string }
  | { type: "CAST_SPELL"; payload: CastSpellPayload }
  | { type: "BREW_POTION"; payload: BrewPotionPayload }
  | { type: "USE_ITEM"; payload: UseItemPayload }
  | { type: "STUDY_BOOK"; payload: StudyBookPayload }
  | { type: "TOGGLE_BOOKMARK"; payload: string }
  | { type: "CHANGE_RELATIONSHIP"; payload: ChangeRelationshipPayload }
  | { type: "RESOLVE_ADVENTURE_ENDING"; payload: AdventureRewardPayload }
  | { type: "VIEW_ACCEPTANCE_LETTER" }
  | { type: "COMPLETE_TUTORIAL" }
  | { type: "SEND_OWL_POST_MESSAGE"; payload: SendOwlPostPayload }
  | { type: "MARK_OWL_POST_READ"; payload: string }
  | { type: "MARK_ALL_OWL_POST_READ" }
  | { type: "AWARD_HOUSE_POINTS"; payload: AwardHousePointsPayload }
  | { type: "SUBMIT_ASSIGNMENT"; payload: { assignmentId: string } }
  | { type: "APPLY_PROFESSOR_GRADE"; payload: ApplyProfessorGradePayload }
  | { type: "ADD_PERSONAL_NOTE"; payload: string }
  | { type: "REMOVE_PERSONAL_NOTE"; payload: string }
  | { type: "ADD_REMINDER"; payload: { text: string; dueDate?: string } }
  | { type: "TOGGLE_REMINDER"; payload: string }
  | { type: "REMOVE_REMINDER"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<GameSettings> }
  | { type: "UNLOCK_ACHIEVEMENTS"; payload: string[] }
  | { type: "LOAD_STATE"; payload: GameState }
  | { type: "RESET" };

function addInventoryItem(
  inventory: InventoryItem[],
  name: string,
  category: InventoryItem["category"],
  quantity: number
): InventoryItem[] {
  const existing = inventory.find((item) => item.name === name && item.category === category);
  if (existing) {
    return inventory.map((item) =>
      item.id === existing.id ? { ...item, quantity: item.quantity + quantity } : item
    );
  }
  return [
    ...inventory,
    {
      id: `${category.toLowerCase().replace(/\s+/g, "-")}-${name.toLowerCase().replace(/\s+/g, "-")}`,
      name,
      category,
      quantity,
    },
  ];
}

// The one place house-points math + the award log happen - every case that
// changes housePoints (below) goes through this instead of its own inline
// math, and AWARD_HOUSE_POINTS exposes the same path to any future feature.
function applyHousePointsAward(character: Character, payload: AwardHousePointsPayload): Character {
  const housePoints = { ...character.housePoints };
  housePoints[payload.house] = Math.max(0, housePoints[payload.house] + payload.amount);

  const award: HousePointAward = {
    id: payload.id ?? crypto.randomUUID(),
    house: payload.house,
    amount: payload.amount,
    reason: payload.reason,
    awardedBy: payload.awardedBy,
    timestamp: payload.timestamp ?? new Date().toISOString(),
  };

  return {
    ...character,
    housePoints,
    housePointAwards: [award, ...character.housePointAwards],
  };
}

// The one place an OwlPostMessage gets constructed - SEND_OWL_POST_MESSAGE
// uses this directly, and any reducer case that needs to send a message as
// part of a larger state change (e.g. SUBMIT_ASSIGNMENT) reuses it instead
// of building the object inline a second way.
function buildOwlPostMessage(payload: SendOwlPostPayload): OwlPostMessage {
  return {
    id: payload.id ?? crypto.randomUUID(),
    category: payload.category,
    sender: payload.sender,
    subject: payload.subject,
    body: payload.body,
    timestamp: payload.timestamp ?? new Date().toISOString(),
    read: false,
  };
}

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CREATE_CHARACTER":
      return { ...state, character: action.payload };
    case "UPDATE_CHARACTER":
      if (!state.character) return state;
      return { ...state, character: { ...state.character, ...action.payload } };
    case "COMPLETE_COMMON_ROOM_INTRO": {
      if (!state.character) return state;
      const { startingHousePoints } = action.payload;
      let character = state.character;
      if (character.house) {
        character = applyHousePointsAward(character, {
          house: character.house,
          amount: startingHousePoints,
          reason: "Welcome to your house",
          awardedBy: "Common Room",
        });
      }
      return { ...state, character: { ...character, commonRoomIntroViewed: true } };
    }
    case "DISCOVER_LOCATION": {
      if (!state.character) return state;
      if (state.character.discoveredLocations.includes(action.payload)) return state;
      return {
        ...state,
        character: {
          ...state.character,
          discoveredLocations: [...state.character.discoveredLocations, action.payload],
        },
      };
    }
    case "CAST_SPELL": {
      if (!state.character) return state;
      const { spellId, manaCost, xpAward, masteryGain, success } = action.payload;

      const characterAfterMana: Character = {
        ...state.character,
        energy: clamp(state.character.energy - manaCost, 0, state.character.maxEnergy),
      };
      const characterAfterXp = success ? awardXp(characterAfterMana, xpAward) : characterAfterMana;

      const existing = state.character.spellbook.find((s) => s.spellId === spellId);
      const nextMastery = clamp((existing?.mastery ?? 0) + (success ? masteryGain : 1), 0, 100);
      const spellbook = existing
        ? state.character.spellbook.map((s) =>
            s.spellId === spellId ? { ...s, mastery: nextMastery, unlocked: true } : s
          )
        : [...state.character.spellbook, { spellId, mastery: nextMastery, unlocked: true }];

      return { ...state, character: { ...characterAfterXp, spellbook } };
    }
    case "BREW_POTION": {
      if (!state.character) return state;
      const { potionId, potionName, xpAward, masteryGain, yieldsPotion, housePointsDelta } =
        action.payload;

      const characterAfterXp = xpAward > 0 ? awardXp(state.character, xpAward) : state.character;

      const existing = state.character.potionProgress[potionId];
      const potionProgress = {
        ...state.character.potionProgress,
        [potionId]: {
          potionId,
          mastery: clamp((existing?.mastery ?? 0) + masteryGain, 0, 100),
          timesBrewed: (existing?.timesBrewed ?? 0) + 1,
        },
      };

      const inventory = yieldsPotion
        ? addInventoryItem(state.character.inventory, potionName, "Potion", 1)
        : state.character.inventory;

      let character: Character = { ...characterAfterXp, potionProgress, inventory };
      if (character.house && housePointsDelta !== 0) {
        character = applyHousePointsAward(character, {
          house: character.house,
          amount: housePointsDelta,
          reason: `Brewing ${potionName}`,
          awardedBy: "Potions",
        });
      }

      return { ...state, character };
    }
    case "USE_ITEM": {
      if (!state.character) return state;
      const { itemId, healthDelta = 0, energyDelta = 0, knowledgeDelta = 0 } = action.payload;
      const item = state.character.inventory.find((i) => i.id === itemId);
      if (!item || item.quantity <= 0) return state;

      const inventory = state.character.inventory
        .map((i) => (i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i))
        .filter((i) => i.quantity > 0);

      const character: Character = {
        ...state.character,
        health: clamp(state.character.health + healthDelta, 0, state.character.maxHealth),
        energy: clamp(state.character.energy + energyDelta, 0, state.character.maxEnergy),
        knowledge: Math.max(0, state.character.knowledge + knowledgeDelta),
        inventory,
      };

      return { ...state, character };
    }
    case "STUDY_BOOK": {
      if (!state.character) return state;
      if (state.character.studiedBooks.includes(action.payload.bookId)) return state;
      const { bookId, knowledgeReward, unlocksSpellId, unlocksLocationId } = action.payload;

      let spellbook = state.character.spellbook;
      if (unlocksSpellId && !spellbook.some((s) => s.spellId === unlocksSpellId)) {
        spellbook = [...spellbook, { spellId: unlocksSpellId, mastery: 0, unlocked: true }];
      }

      let discoveredLocations = state.character.discoveredLocations;
      if (unlocksLocationId && !discoveredLocations.includes(unlocksLocationId)) {
        discoveredLocations = [...discoveredLocations, unlocksLocationId];
      }

      return {
        ...state,
        character: {
          ...state.character,
          knowledge: state.character.knowledge + knowledgeReward,
          spellbook,
          discoveredLocations,
          studiedBooks: [...state.character.studiedBooks, bookId],
        },
      };
    }
    case "TOGGLE_BOOKMARK": {
      if (!state.character) return state;
      const bookId = action.payload;
      const bookmarkedBooks = state.character.bookmarkedBooks.includes(bookId)
        ? state.character.bookmarkedBooks.filter((id) => id !== bookId)
        : [...state.character.bookmarkedBooks, bookId];
      return { ...state, character: { ...state.character, bookmarkedBooks } };
    }
    case "CHANGE_RELATIONSHIP": {
      if (!state.character) return state;
      const { studentId, delta } = action.payload;
      const current = state.character.relationships[studentId] ?? 0;
      return {
        ...state,
        character: {
          ...state.character,
          relationships: {
            ...state.character.relationships,
            [studentId]: clamp(current + delta, 0, 100),
          },
        },
      };
    }
    case "RESOLVE_ADVENTURE_ENDING": {
      if (!state.character) return state;
      const {
        questId,
        questTitle,
        questDescription,
        xp = 0,
        housePoints: housePointsGain = 0,
        knowledge = 0,
        relationshipChanges = [],
        inventoryItem,
        unlocksSpellId,
        unlocksLocationId,
      } = action.payload;

      let character = xp > 0 ? awardXp(state.character, xp) : state.character;
      if (knowledge !== 0) {
        character = { ...character, knowledge: Math.max(0, character.knowledge + knowledge) };
      }

      if (character.house && housePointsGain !== 0) {
        character = applyHousePointsAward(character, {
          house: character.house,
          amount: housePointsGain,
          reason: questTitle,
          awardedBy: "Campus Map",
        });
      }

      let relationships = character.relationships;
      if (relationshipChanges.length > 0) {
        relationships = { ...relationships };
        for (const change of relationshipChanges) {
          const current = relationships[change.studentId] ?? 0;
          relationships[change.studentId] = clamp(current + change.delta, 0, 100);
        }
      }

      const inventory = inventoryItem
        ? addInventoryItem(
            character.inventory,
            inventoryItem.name,
            inventoryItem.category,
            inventoryItem.quantity
          )
        : character.inventory;

      let spellbook = character.spellbook;
      if (unlocksSpellId && !spellbook.some((s) => s.spellId === unlocksSpellId)) {
        spellbook = [...spellbook, { spellId: unlocksSpellId, mastery: 0, unlocked: true }];
      }

      let discoveredLocations = character.discoveredLocations;
      if (unlocksLocationId && !discoveredLocations.includes(unlocksLocationId)) {
        discoveredLocations = [...discoveredLocations, unlocksLocationId];
      }

      const existingQuest = character.quests.find((q) => q.id === questId);
      const quests = existingQuest
        ? character.quests.map((q) => (q.id === questId ? { ...q, completed: true } : q))
        : [
            ...character.quests,
            {
              id: questId,
              title: questTitle,
              description: questDescription,
              completed: true,
              rewardXp: xp,
              rewardHousePoints: housePointsGain,
            },
          ];

      return {
        ...state,
        character: {
          ...character,
          relationships,
          inventory,
          spellbook,
          discoveredLocations,
          quests,
        },
      };
    }
    case "VIEW_ACCEPTANCE_LETTER":
      if (!state.character) return state;
      return { ...state, character: { ...state.character, acceptanceLetterViewed: true } };
    case "COMPLETE_TUTORIAL":
      if (!state.character) return state;
      return { ...state, character: { ...state.character, tutorialCompleted: true } };
    case "SEND_OWL_POST_MESSAGE": {
      if (!state.character) return state;
      const id = action.payload.id ?? crypto.randomUUID();
      // Idempotent by id, so a seed (or a retried dispatch) can never
      // duplicate a message that's already in the inbox.
      if (state.character.owlPost.some((m) => m.id === id)) return state;
      const message = buildOwlPostMessage({ ...action.payload, id });
      return {
        ...state,
        character: { ...state.character, owlPost: [message, ...state.character.owlPost] },
      };
    }
    case "MARK_OWL_POST_READ": {
      if (!state.character) return state;
      const owlPost = state.character.owlPost.map((m) =>
        m.id === action.payload ? { ...m, read: true } : m
      );
      return { ...state, character: { ...state.character, owlPost } };
    }
    case "MARK_ALL_OWL_POST_READ": {
      if (!state.character) return state;
      const owlPost = state.character.owlPost.map((m) => ({ ...m, read: true }));
      return { ...state, character: { ...state.character, owlPost } };
    }
    case "AWARD_HOUSE_POINTS": {
      if (!state.character) return state;
      return { ...state, character: applyHousePointsAward(state.character, action.payload) };
    }
    case "SUBMIT_ASSIGNMENT": {
      if (!state.character) return state;
      const { assignmentId } = action.payload;
      const assignment = getAssignment(assignmentId);
      if (!assignment) return state;
      if (state.character.assignmentSubmissions[assignmentId]?.status === "Submitted") return state;

      const submission: AssignmentSubmission = {
        assignmentId,
        status: "Submitted",
        submittedAt: new Date().toISOString(),
      };

      let character: Character = {
        ...state.character,
        assignmentSubmissions: {
          ...state.character.assignmentSubmissions,
          [assignmentId]: submission,
        },
      };

      if (character.house && assignment.housePointsReward) {
        character = applyHousePointsAward(character, {
          house: character.house,
          amount: assignment.housePointsReward,
          reason: `Submitted "${assignment.title}"`,
          awardedBy: "Assignments",
        });
      }

      const confirmation = buildOwlPostMessage({
        category: "Professors",
        sender: "Assignments Office",
        subject: `"${assignment.title}" Received`,
        body: `Your submission for "${assignment.title}" has been received and is awaiting review.`,
      });
      character = { ...character, owlPost: [confirmation, ...character.owlPost] };

      return { ...state, character };
    }
    // Phase 3D - Grade Management Bridge. Sole responsibility: move the
    // existing submission from "Submitted" to "Graded" and record the
    // score. No house points, no Owl Post, nothing else - those are
    // separate, already-existing actions the caller (GradeBridgeSync)
    // dispatches on its own. A missing or non-"Submitted" entry is a
    // normal, silent no-op, not an error.
    case "APPLY_PROFESSOR_GRADE": {
      if (!state.character) return state;
      const { assignmentId, grade } = action.payload;
      const existing = state.character.assignmentSubmissions[assignmentId];
      if (!existing || existing.status !== "Submitted") return state;

      const submission: AssignmentSubmission = { ...existing, status: "Graded", grade };
      return {
        ...state,
        character: {
          ...state.character,
          assignmentSubmissions: { ...state.character.assignmentSubmissions, [assignmentId]: submission },
        },
      };
    }
    case "ADD_PERSONAL_NOTE": {
      if (!state.character) return state;
      const note: PersonalNote = {
        id: crypto.randomUUID(),
        text: action.payload,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        character: { ...state.character, personalNotes: [note, ...state.character.personalNotes] },
      };
    }
    case "REMOVE_PERSONAL_NOTE": {
      if (!state.character) return state;
      return {
        ...state,
        character: {
          ...state.character,
          personalNotes: state.character.personalNotes.filter((n) => n.id !== action.payload),
        },
      };
    }
    case "ADD_REMINDER": {
      if (!state.character) return state;
      const reminder: Reminder = {
        id: crypto.randomUUID(),
        text: action.payload.text,
        dueDate: action.payload.dueDate,
        completed: false,
        createdAt: new Date().toISOString(),
      };
      return {
        ...state,
        character: { ...state.character, reminders: [reminder, ...state.character.reminders] },
      };
    }
    case "TOGGLE_REMINDER": {
      if (!state.character) return state;
      const reminders = state.character.reminders.map((r) =>
        r.id === action.payload ? { ...r, completed: !r.completed } : r
      );
      return { ...state, character: { ...state.character, reminders } };
    }
    case "REMOVE_REMINDER": {
      if (!state.character) return state;
      return {
        ...state,
        character: {
          ...state.character,
          reminders: state.character.reminders.filter((r) => r.id !== action.payload),
        },
      };
    }
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "UNLOCK_ACHIEVEMENTS": {
      if (!state.character) return state;
      const newIds = action.payload.filter((id) => !state.character!.achievements.includes(id));
      if (newIds.length === 0) return state;
      return {
        ...state,
        character: { ...state.character, achievements: [...state.character.achievements, ...newIds] },
      };
    }
    case "LOAD_STATE":
      return action.payload;
    case "RESET":
      return initialState;
    default:
      return state;
  }
}

interface GameContextValue {
  state: GameState;
  dispatch: Dispatch<GameAction>;
  resetGame: () => void;
  syncStatus: SyncStatus;
  pendingGuestAdoption: boolean;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (base) => {
    const saved = loadGameState();
    return saved ? { ...base, ...saved } : base;
  });

  const { user } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [pendingGuestAdoption, setPendingGuestAdoption] = useState(false);

  const stateRef = useRef(state);
  const previousUserId = useRef<string | null>(null);
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  useEffect(() => {
    if (!state.character) return;
    const newIds = getUnlockedAchievementIds(state).filter(
      (id) => !state.character!.achievements.includes(id)
    );
    if (newIds.length > 0) {
      dispatch({ type: "UNLOCK_ACHIEVEMENTS", payload: newIds });
    }
  }, [state]);

  // Same pattern as the achievement check above: whenever an onboarding
  // milestone a seed cares about becomes true, send that seed's Owl Post
  // message if it hasn't been sent yet. This is also the reference example
  // for how a future system (Academics, House Cup, ...) would react to
  // state and publish its own message via SEND_OWL_POST_MESSAGE.
  useEffect(() => {
    if (!state.character) return;
    const character = state.character;
    const existingIds = new Set(character.owlPost.map((m) => m.id));
    const due = owlPostSeeds.filter(
      (seed) => seed.isEligible(character) && !existingIds.has(seed.id)
    );
    for (const seed of due) {
      dispatch({
        type: "SEND_OWL_POST_MESSAGE",
        payload: { id: seed.id, category: seed.category, ...seed.build(character) },
      });
    }
  }, [state]);

  // Fetch the cloud save once per sign-in. If none exists yet and this device
  // has local guest progress, offer to adopt it instead of silently choosing.
  useEffect(() => {
    const userId = user?.id ?? null;
    if (userId === previousUserId.current) return;
    previousUserId.current = userId;
    if (!userId) return;

    // Snapshot "did this device have a save *before* we asked the cloud"
    // synchronously, right now - not inside the .then() below. Reading
    // stateRef.current there instead would race a player who creates their
    // character while the fetch is still in flight (now a normal timing
    // window, since Character Creation happens right after sign-up): by the
    // time the promise resolves, stateRef.current.character would already
    // be the character they just made, not a pre-existing guest save,
    // wrongly triggering the "keep your progress?" prompt on every signup.
    const hadLocalSaveBeforeFetch = Boolean(stateRef.current.character);

    let cancelled = false;
    setSyncStatus("saving");
    fetchCloudSave(userId)
      .then((cloudState) => {
        if (cancelled) return;
        if (cloudState) {
          dispatch({ type: "LOAD_STATE", payload: { ...initialState, ...cloudState } });
          setSyncStatus("saved");
        } else if (hadLocalSaveBeforeFetch) {
          setPendingGuestAdoption(true);
          setSyncStatus("idle");
        } else {
          setSyncStatus("idle");
        }
      })
      .catch(() => {
        if (!cancelled) setSyncStatus("offline");
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Debounced push to the cloud while signed in — paused while a guest-adoption
  // decision is pending, so we never sync before the player has chosen.
  useEffect(() => {
    if (!user || pendingGuestAdoption) return;
    if (pushTimer.current) clearTimeout(pushTimer.current);

    pushTimer.current = setTimeout(() => {
      setSyncStatus("saving");
      upsertCloudSave(user.id, state)
        .then(() => setSyncStatus("saved"))
        .catch(() => setSyncStatus("offline"));
    }, CLOUD_PUSH_DEBOUNCE_MS);

    return () => {
      if (pushTimer.current) clearTimeout(pushTimer.current);
    };
  }, [state, user, pendingGuestAdoption]);

  function resetGame() {
    clearGameState();
    dispatch({ type: "RESET" });
  }

  function adoptGuestSave() {
    if (!user) return;
    setPendingGuestAdoption(false);
    setSyncStatus("saving");
    upsertCloudSave(user.id, stateRef.current)
      .then(() => setSyncStatus("saved"))
      .catch(() => setSyncStatus("offline"));
  }

  function discardGuestSave() {
    setPendingGuestAdoption(false);
    resetGame();
  }

  return (
    <GameContext.Provider
      value={{ state, dispatch, resetGame, syncStatus, pendingGuestAdoption }}
    >
      {children}
      {pendingGuestAdoption && (
        <ConfirmDialog
          title="Keep your existing progress?"
          message="You have progress saved on this device. Save it as your new account's cloud save? If you'd rather start over, this device's progress will be cleared."
          confirmLabel="Keep My Progress"
          cancelLabel="Start Fresh Instead"
          onConfirm={adoptGuestSave}
          onCancel={discardGuestSave}
        />
      )}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within a GameProvider");
  }
  return context;
}
