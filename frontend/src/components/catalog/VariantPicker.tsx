"use client";

import { useMemo, useState } from "react";
import { formatMoney } from "@/lib/money";

export type Variant = {
  id: string;
  sku: string;
  title: string;               // e.g. "Black / M"
  price: string;               // backend sends strings
  compare_at?: string | null;  // may be null
  barcode?: string | null;
  weight_grams?: number | null;
};

type Props = {
  currency: string;
  variants: Variant[];
  onSelect?: (variantId: string) => void;
};

export default function VariantPicker({ currency, variants, onSelect }: Props) {
  const [sel, setSel] = useState(variants[0]?.id ?? "");

  const current = useMemo(
    () => variants.find(v => v.id === sel) ?? variants[0],
    [sel, variants]
  );

  function change(e: React.ChangeEvent<HTMLSelectElement>) {
    const v = e.target.value;
    setSel(v);
    onSelect?.(v);
  }

  const price = Number(current?.price ?? 0);
  const compare = current?.compare_at ? Number(current.compare_at) : null;

  return (
    <div className="space-y-4">
      {/* Variant dropdown */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Choose variant</label>
        <select
          className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          value={sel}
          onChange={change}
        >
          {variants.map(v => (
            <option key={v.id} value={v.id}>
              {v.title} {v.sku ? `• ${v.sku}` : ""}
            </option>
          ))}
        </select>
      </div>

      {/* Price block */}
      <div className="flex items-baseline gap-3">
        <span className="text-2xl font-bold text-slate-900">{formatMoney(price, currency)}</span>
        {compare && compare > price && (
          <span className="text-slate-400 line-through">{formatMoney(compare, currency)}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          className="inline-flex h-11 items-center justify-center rounded-md px-5 bg-emerald-600 text-white hover:bg-emerald-700 transition"
          onClick={() => alert(`Add to cart: variant ${current?.id}`)}
        >
          Add to cart
        </button>
        <button
          className="inline-flex h-11 items-center justify-center rounded-md px-5 border border-slate-300 hover:bg-slate-50 transition"
          onClick={() => alert("Saved to wishlist (stub)")}
        >
          Wishlist
        </button>
      </div>

      {/* Tiny meta */}
      <div className="text-xs text-slate-500">
        {current?.barcode ? <>Barcode: {current.barcode} • </> : null}
        {current?.weight_grams ? <>Weight: {current.weight_grams}g</> : null}
      </div>
    </div>
  );
}
