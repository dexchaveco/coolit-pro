"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui";

type Row = { key: number };

export function InvoiceLineItemsEditor() {
  const [rows, setRows] = useState<Row[]>([{ key: 0 }, { key: 1 }]);
  const [nextKey, setNextKey] = useState(2);

  return (
    <div className="space-y-2">
      {rows.map((row) => (
        <div key={row.key} className="flex items-center gap-2">
          <Input name="item_description" placeholder="Description (e.g. Capacitor replacement)" className="flex-1" />
          <Input name="item_quantity" type="number" step="0.01" defaultValue="1" placeholder="Qty" className="w-20" />
          <Input name="item_price" type="number" step="0.01" placeholder="Price" className="w-28" />
          <button
            type="button"
            onClick={() => setRows((r) => r.filter((x) => x.key !== row.key))}
            className="p-2 text-ink-muted hover:text-critical shrink-0"
            aria-label="Remove line item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => {
          setRows((r) => [...r, { key: nextKey }]);
          setNextKey((k) => k + 1);
        }}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
      >
        <Plus className="h-4 w-4" /> Add line item
      </button>
    </div>
  );
}
