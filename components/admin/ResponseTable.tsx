import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
    <Table className="min-w-190 tabular-nums">
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Total</TableHead>
          {sections.map((s) => (
            <TableHead key={s.id} className="text-right">
              {s.title}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell>{formatDate(row.createdAt)}</TableCell>
            <TableCell className="text-right font-medium">
              {row.total}
              <span className="font-normal text-muted-foreground"> / {maximum}</span>
            </TableCell>
            {sections.map((s) => (
              <TableCell key={s.id} className="text-right">
                {row.domains[s.id] ?? 0}
                <span className="text-muted-foreground"> / {s.choices.length}</span>
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
