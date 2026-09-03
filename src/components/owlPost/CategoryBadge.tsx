import type { OwlPostCategory } from "../../types/owlPost";

export const OWL_POST_CATEGORY_COLORS: Record<OwlPostCategory, string> = {
  Admissions: "#c9a646",
  Professors: "#5b8fb9",
  School: "#8b7fc7",
  House: "#6b9e6b",
  Personal: "#c77b9e",
};

export function CategoryBadge({ category }: { category: OwlPostCategory }) {
  const color = OWL_POST_CATEGORY_COLORS[category];
  return (
    <span
      className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full border shrink-0"
      style={{ color, borderColor: `${color}66`, background: `${color}15` }}
    >
      {category}
    </span>
  );
}
