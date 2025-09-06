"use client";

import { useState } from "react";

export type GalleryImage = { url: string; alt?: string | null };

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const list = images.length ? images : [{ url: "/placeholder.svg", alt: "No image" }];
  const [idx, setIdx] = useState(0);
  const current = list[Math.min(idx, list.length - 1)];

  return (
    <div className="rounded-xl border border-slate-200 overflow-hidden">
      {/* Main image */}
      <div className="aspect-square w-full bg-slate-50 grid place-items-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.alt ?? ""}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      {/* Thumbnails */}
      {list.length > 1 && (
        <div className="p-3 border-t border-slate-200">
          <div className="flex gap-2 overflow-x-auto">
            {list.map((img, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={`h-16 w-16 rounded-md overflow-hidden border ${
                  i === idx ? "border-emerald-500 ring-2 ring-emerald-300" : "border-slate-200"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt={img.alt ?? ""} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
