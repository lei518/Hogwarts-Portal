import { useGame } from "../../context/GameContext";
import { Button } from "../../components/ui/Button";
import { getItemEffect } from "../../utils/itemEffects";
import type { InventoryItem } from "../../types/game";

const CATEGORY_ORDER: InventoryItem["category"][] = [
  "Potion",
  "Ingredient",
  "Book",
  "Magical Item",
  "Quest Item",
];

const categoryEmoji: Record<InventoryItem["category"], string> = {
  Potion: "🧪",
  Ingredient: "🌿",
  Book: "📖",
  "Quest Item": "🗝️",
  "Magical Item": "🪄",
};

export function InventoryPage() {
  const { state, dispatch } = useGame();

  if (!state.character) return null;

  function handleUse(item: InventoryItem) {
    const effect = getItemEffect(item.name);
    if (!effect) return;
    dispatch({
      type: "USE_ITEM",
      payload: {
        itemId: item.id,
        healthDelta: effect.healthDelta,
        energyDelta: effect.energyDelta,
        knowledgeDelta: effect.knowledgeDelta,
      },
    });
  }

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-6">🎒 Inventory</h1>

      {state.character.inventory.length === 0 && (
        <p className="text-parchment-dim text-sm">
          Your bag is empty. Brew a potion or complete a quest to find something worth carrying.
        </p>
      )}

      {CATEGORY_ORDER.map((category) => {
        const items = state.character!.inventory.filter((i) => i.category === category);
        if (items.length === 0) return null;

        return (
          <section key={category} className="mb-8">
            <h2 className="text-sm uppercase tracking-[0.2em] text-parchment-dim mb-3">
              {categoryEmoji[category]} {category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => {
                const effect = getItemEffect(item.name);
                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between border border-parchment-dim/20 rounded-sm px-4 py-3"
                  >
                    <div>
                      <p className="text-parchment font-display">
                        {item.name} <span className="text-parchment-dim">×{item.quantity}</span>
                      </p>
                      {effect && (
                        <p className="text-parchment-dim text-xs">{effect.description}</p>
                      )}
                    </div>
                    {effect && (
                      <Button variant="secondary" onClick={() => handleUse(item)}>
                        Use
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
