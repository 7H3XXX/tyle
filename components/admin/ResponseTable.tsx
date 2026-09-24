import type { ResponseRow } from "@/lib/analytics/aggregate";
import type { Section } from "@/lib/form/types";
import { formatDate } from "./format";

type ResponseTableProps = {
  rows: ResponseRow[];
  sections: Section[];
  maximum: number;
};

export function ResponseTable({ rows, sections, maximum }: ResponseTableProps) {
  return (
    <div className="-mx-5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
      <table className="w-full min-w-190 border-collapse text-sm tabular-nums">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            <th scope="col" className="py-2.5 pr-4 font-medium">Date</th>
            <th scope="col" className="py-2.5 pr-4 text-right font-medium">Total</th>
            {sections.map((s) => (
              <th key={s.id} scope="col" className="py-2.5 pr-4 text-right font-medium last:pr-0">
                {s.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-border last:border-b-0">
              <td className="whitespace-nowrap py-2.5 pr-4">{formatDate(row.createdAt)}</td>
              <td className="py-2.5 pr-4 text-right font-medium">
                {row.total}
                <span className="text-muted"> / {maximum}</span>
              </td>
              {sections.map((s) => (
                <td key={s.id} className="py-2.5 pr-4 text-right last:pr-0">
                  {row.domains[s.id] ?? 0}
                  <span className="text-muted"> / {s.choices.length}</span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
