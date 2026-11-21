'use client';

import { renderInline } from './inline';

/**
 * Compact documentation table. Cells are plain strings rendered through
 * the inline formatter, so `` `code` `` and **bold** work everywhere.
 */
export function ApiTable({ head, rows }: { head: string[]; rows: string[][] }) {
  return (
    <div className="mt-5 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-muted/50">
            {head.map((h) => (
              <th
                key={h}
                className="border-b border-border px-4 py-2.5 text-left font-medium text-foreground"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="odd:bg-muted/30">
              {row.map((cell, j) => (
                <td key={j} className="border-b border-border/60 px-4 py-2.5 align-top text-muted-foreground">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
