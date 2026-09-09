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
import type { GameSettings, GameState, House } from "../types/game";
import { DEFAULT_SETTINGS } from "../types/game";
import type { Character } from "../types/character";
import type { HousePointAward, PersonalNote, Reminder } from "../types/campusLife";
import { loadGameState, saveGameState, clearGameState } from "../utils/storage";
import { clamp } from "../utils/xpSystem";
import { getUnlockedAchievementIds } from "../data/achievements";
import { useAuth } from "./AuthContext";
import { fetchCloudSave, upsertCloudSave } from "../services/supabase";
import { createInitialCharacter, splitFullName } from "../utils/character";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";

export type SyncStatus = "idle" | "saving" | "saved" | "offline";

const CLOUD_PUSH_DEBOUNCE_MS = 2500;

const initialState: GameState = {
  character: null,
  settings: DEFAULT_SETTINGS,
};

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

// The single publish API for House Points - any feature (Potions, an
// adventure, Quidditch, a professor, an assignment grade, an automated
// system) awards or deducts points this same way, and House Cup never
// needs to change to pick up a new source. `awardedBy` is deliberately
// free text, not a closed union, so a future source can name itself
// without a type change here.
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
  housePoints?: number;
  knowledge?: number;
  relationshipChanges?: { studentId: string; delta: number }[];
  unlocksSpellId?: string;
  unlocksLocationId?: string;
}

type GameAction =
  | { type: "CREATE_CHARACTER"; payload: Character }
  | { type: "UPDATE_CHARACTER"; payload: Partial<Character> }
  | { type: "COMPLETE_SORTING"; payload: { house: House; startingHousePoints: number } }
  | { type: "DISCOVER_LOCATION"; payload: string }
  // Phase 4 - Spell/Potion Archive: no casting/brewing minigame - a
  // student simply marks something studied, the same "I've read this"
  // action TOGGLE_BOOKMARK already models for Library books.
  | { type: "STUDY_SPELL"; payload: { spellId: string } }
  | { type: "STUDY_POTION"; payload: { potionId: string } }
  | { type: "STUDY_BOOK"; payload: StudyBookPayload }
  | { type: "TOGGLE_BOOKMARK"; payload: string }
  | { type: "CHANGE_RELATIONSHIP"; payload: ChangeRelationshipPayload }
  | { type: "RESOLVE_ADVENTURE_ENDING"; payload: AdventureRewardPayload }
  | { type: "AWARD_HOUSE_POINTS"; payload: AwardHousePointsPayload }
  | { type: "ADD_PERSONAL_NOTE"; payload: string }
  | { type: "REMOVE_PERSONAL_NOTE"; payload: string }
  | { type: "ADD_REMINDER"; payload: { text: string; dueDate?: string } }
  | { type: "TOGGLE_REMINDER"; payload: string }
  | { type: "REMOVE_REMINDER"; payload: string }
  | { type: "UPDATE_SETTINGS"; payload: Partial<GameSettings> }
  | { type: "UNLOCK_ACHIEVEMENTS"; payload: string[] }
  | { type: "LOAD_STATE"; payload: GameState }
  | { type: "RESET" };

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

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "CREATE_CHARACTER":
      return { ...state, character: action.payload };
    case "UPDATE_CHARACTER":
      if (!state.character) return state;
      return { ...state, character: { ...state.character, ...action.payload } };
    // Year-Based Onboarding (Phase 6L) - the Sorting Hat's own completion:
    // sets the house and the completed flag, and carries forward the
    // welcome house-points bonus that used to live in the (now removed)
    // Common Room page's own action, one atomic dispatch.
    case "COMPLETE_SORTING": {
      if (!state.character) return state;
      const { house, startingHousePoints } = action.payload;
      const character = applyHousePointsAward(
        { ...state.character, house, sortingCompleted: true },
        { house, amount: startingHousePoints, reason: "Welcome to your house", awardedBy: "Sorting Hat" }
      );
      return { ...state, character };
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
    case "STUDY_SPELL": {
      if (!state.character) return state;
      const { spellId } = action.payload;
      if (state.character.spellbook.some((s) => s.spellId === spellId && s.studied)) return state;

      const existing = state.character.spellbook.find((s) => s.spellId === spellId);
      const entry = { spellId, studied: true, studiedAt: new Date().toISOString() };
      const spellbook = existing
        ? state.character.spellbook.map((s) => (s.spellId === spellId ? entry : s))
        : [...state.character.spellbook, entry];

      return { ...state, character: { ...state.character, spellbook } };
    }
    case "STUDY_POTION": {
      if (!state.character) return state;
      const { potionId } = action.payload;
      if (state.character.potionProgress[potionId]?.studied) return state;

      const potionProgress = {
        ...state.character.potionProgress,
        [potionId]: { potionId, studied: true, studiedAt: new Date().toISOString() },
      };

      return { ...state, character: { ...state.character, potionProgress } };
    }
    case "STUDY_BOOK": {
      if (!state.character) return state;
      if (state.character.studiedBooks.includes(action.payload.bookId)) return state;
      const { bookId, knowledgeReward, unlocksSpellId, unlocksLocationId } = action.payload;

      // Phase 4 - Spell Archive: no locked/unlocked spells anymore, so
      // "unlocking" a spell via a book now just marks it studied - reading
      // about a spell counts as studying it.
      let spellbook = state.character.spellbook;
      if (unlocksSpellId && !spellbook.some((s) => s.spellId === unlocksSpellId)) {
        spellbook = [...spellbook, { spellId: unlocksSpellId, studied: true, studiedAt: new Date().toISOString() }];
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
        housePoints: housePointsGain = 0,
        knowledge = 0,
        relationshipChanges = [],
        unlocksSpellId,
        unlocksLocationId,
      } = action.payload;

      let character = state.character;
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

      let spellbook = character.spellbook;
      if (unlocksSpellId && !spellbook.some((s) => s.spellId === unlocksSpellId)) {
        spellbook = [...spellbook, { spellId: unlocksSpellId, studied: true, studiedAt: new Date().toISOString() }];
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
              rewardHousePoints: housePointsGain,
            },
          ];

      return {
        ...state,
        character: {
          ...character,
          relationships,
          spellbook,
          discoveredLocations,
          quests,
        },
      };
    }
    case "AWARD_HOUSE_POINTS": {
      if (!state.character) return state;
      return { ...state, character: applyHousePointsAward(state.character, action.payload) };
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
  syncStatus: SyncStatus;
  pendingGuestAdoption: boolean;
  // Year-Based Onboarding (Phase 6L) - true once it's known whether a
  // Character should exist for the signed-in user (a cloud character was
  // found, or definitively none exists) - see the auto-synthesis effect
  // below. JourneyGate reads this to avoid bouncing through Landing while
  // a student's Character is still being resolved/synthesized.
  cloudCheckComplete: boolean;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState, (base) => {
    const saved = loadGameState();
    return saved ? { ...base, ...saved } : base;
  });

  const { user, profile, loading: authLoading } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>("idle");
  const [pendingGuestAdoption, setPendingGuestAdoption] = useState(false);
  const [cloudCheckComplete, setCloudCheckComplete] = useState(false);

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

  // Fetch the cloud save once per sign-in. If none exists yet and this device
  // has local guest progress, offer to adopt it instead of silently choosing.
  useEffect(() => {
    const userId = user?.id ?? null;
    if (userId === previousUserId.current) return;
    previousUserId.current = userId;
    setCloudCheckComplete(false);
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
          setCloudCheckComplete(true);
        } else if (hadLocalSaveBeforeFetch) {
          // Unresolved - the player still has to choose keep-vs-discard,
          // so this deliberately does NOT set cloudCheckComplete yet (see
          // adoptGuestSave/discardGuestSave below, which resolve it).
          setPendingGuestAdoption(true);
          setSyncStatus("idle");
        } else {
          setSyncStatus("idle");
          setCloudCheckComplete(true);
        }
      })
      .catch(() => {
        if (!cancelled) setSyncStatus("offline");
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Year-Based Onboarding (Phase 6L) - there is no more Character Creation
  // page. Once it's known whether a Character should exist
  // (`cloudCheckComplete`) and it turns out none does, synthesize one,
  // once, from the signed-in student's own AuthContext profile (their
  // Admin-assigned display name/year/house - or, for a self-service
  // signup with no admin-assigned year, a Year 1 default). Gated on
  // `profile.role === "student"` - GameProvider wraps the entire app,
  // including the Professor/Admin route trees, and neither of those roles
  // should ever get a synthesized Character.
  useEffect(() => {
    if (!user || authLoading || !profile) return;
    if (profile.role !== "student") return;
    if (state.character) return;
    if (!cloudCheckComplete || pendingGuestAdoption) return;

    const { firstName, lastName } = splitFullName(profile.displayName);
    const character = createInitialCharacter({
      firstName,
      lastName,
      year: profile.year ?? undefined,
      house: profile.house ?? undefined,
    });
    dispatch({ type: "CREATE_CHARACTER", payload: character });
  }, [user, profile, authLoading, state.character, cloudCheckComplete, pendingGuestAdoption]);

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

  // Internal only - not exposed on GameContextValue. Its one remaining
  // caller is discardGuestSave() below; Settings no longer offers a manual
  // "Reset Progress" control (University Portal Pivot, Phase 6M).
  function resetGame() {
    clearGameState();
    dispatch({ type: "RESET" });
  }

  function adoptGuestSave() {
    if (!user) return;
    setPendingGuestAdoption(false);
    setCloudCheckComplete(true);
    setSyncStatus("saving");
    upsertCloudSave(user.id, stateRef.current)
      .then(() => setSyncStatus("saved"))
      .catch(() => setSyncStatus("offline"));
  }

  function discardGuestSave() {
    setPendingGuestAdoption(false);
    setCloudCheckComplete(true);
    resetGame();
  }

  return (
    <GameContext.Provider
      value={{ state, dispatch, syncStatus, pendingGuestAdoption, cloudCheckComplete }}
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
