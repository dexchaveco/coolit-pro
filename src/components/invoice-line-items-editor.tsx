"use client";

import { useRef, useState } from "react";
import { Plus, Trash2, FileText } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui";
import { SERVICES } from "@/lib/services";
import { hasScopeTemplate, getScopeTemplate } from "@/lib/scope-templates";

type Row = { key: number };

function LineItemRow({ onRemove }: { onRemove: () => void }) {
  const [service, setService] = useState<string>(SERVICES[0]);
  const scopeRef = useRef<HTMLTextAreaElement>(null);
  const showTemplateButton = hasScopeTemplate(service);

  function insertTemplate() {
    const el = scopeRef.current;
    if (!el) return;
    if (el.value.trim() && !confirm("Replace the current scope text with the standard template?")) {
      return;
    }
    el.value = getScopeTemplate(service);
    el.focus();
  }

  return (
    <div className="rounded-xl border border-hairline p-3 space-y-2">
      <div className="flex items-center gap-2">
        <Select
          name="item_service"
          className="flex-1"
          value={service}
          onChange={(e) => setService(e.target.value)}
        >
          {SERVICES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <button
          type="button"
          onClick={onRemove}
          className="p-2 text-ink-muted hover:text-critical shrink-0"
          aria-label="Remove line item"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div>
        <Textarea
          ref={scopeRef}
          name="item_scope"
          rows={3}
          placeholder="Scope of work — specifics (tonnage, brand, model), and inclusions / exclusions / warranty for bigger jobs"
        />
        {showTemplateButton && (
          <button
            type="button"
            onClick={insertTemplate}
            className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand-dark"
          >
            <FileText className="h-3.5 w-3.5" /> Use standard scope / warranty / exclusions template
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Input name="item_quantity" type="number" step="0.01" defaultValue="1" placeholder="Qty" className="w-24" />
        <Input name="item_price" type="number" step="0.01" placeholder="Price" className="flex-1" />
      </div>
    </div>
  );
}

export function InvoiceLineItemsEditor() {
  const [rows, setRows] = useState<Row[]>([{ key: 0 }, { key: 1 }]);
  const [nextKey, setNextKey] = useState(2);

  return (
    <div className="space-y-3">
      {rows.map((row) => (
        <LineItemRow key={row.key} onRemove={() => setRows((r) => r.filter((x) => x.key !== row.key))} />
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
      <p className="text-xs text-ink-muted">
        Pick the service, then put the specifics in the scope field — that keeps QuickBooks&apos; product list clean
        instead of growing a new product for every job. For bigger install jobs, use the standard template to keep
        warranty and exclusions language consistent (and typo-free) on every invoice.
      </p>
    </div>
  );
}
