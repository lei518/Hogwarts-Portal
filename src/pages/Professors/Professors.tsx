import { Link } from "react-router-dom";
import { professors } from "../../data/professors";

export function ProfessorsPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-display text-gold-bright mb-2">🧑‍🏫 Professor Directory</h1>
      <p className="text-parchment-dim text-sm mb-8">The staff teaching at Hogwarts this year.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {professors.map((professor) => (
          <Link
            key={professor.id}
            to={`/professors/${professor.id}`}
            className="block border border-parchment-dim/20 rounded-sm px-5 py-4 hover:border-gold transition-colors duration-150"
          >
            <p className="font-display text-lg text-parchment mb-1">{professor.name}</p>
            <p className="text-parchment-dim text-xs mb-2">{professor.title}</p>
            <p className="text-parchment-dim text-sm">{professor.officeLocation}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
