import type { HTMLAttributes, ReactNode, TdHTMLAttributes, ThHTMLAttributes } from "react";

/** Semantic table set for admin/professor list pages - replaces ad-hoc flex/grid "row" divs. */
export function Table({ children, className = "", ...rest }: HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="overflow-x-auto rounded-lg border border-parchment-dim/15">
      <table className={`w-full text-sm border-collapse ${className}`} {...rest}>
        {children}
      </table>
    </div>
  );
}

export function Thead({ children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return (
    <thead className="bg-void/40" {...rest}>
      {children}
    </thead>
  );
}

export function Tbody({ children, ...rest }: HTMLAttributes<HTMLTableSectionElement>) {
  return <tbody {...rest}>{children}</tbody>;
}

export function Tr({
  children,
  interactive = false,
  className = "",
  ...rest
}: HTMLAttributes<HTMLTableRowElement> & { interactive?: boolean }) {
  return (
    <tr
      className={`border-t border-parchment-dim/10 first:border-t-0 ${
        interactive ? "hover:bg-surface-hover transition-colors" : ""
      } ${className}`}
      {...rest}
    >
      {children}
    </tr>
  );
}

export function Th({ children, className = "", ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={`text-left px-4 py-3 text-[11px] font-medium uppercase tracking-wide text-parchment-dim ${className}`}
      {...rest}
    >
      {children}
    </th>
  );
}

export function Td({ children, className = "", ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td className={`px-4 py-3 text-parchment align-middle ${className}`} {...rest}>
      {children}
    </td>
  );
}

export function TableEmptyRow({ colSpan, children }: { colSpan: number; children: ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-parchment-dim text-sm">
        {children}
      </td>
    </tr>
  );
}
