"use client";

import { useMemo, useState } from "react";

type Img = { url: string; alt?: string | null };

export default function ProductGallery({
  images,
  aspect = "square", // "square" | "landscape"
}: {
  images: Img[];
  /** aspect helps keep a stable box: "square" (default) or "landscape" */
  aspect?: "square" | "landscape";
}) {
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const hero = useMemo(() => images?.[active], [images, active]);
  if (!images?.length) return null;

  const aspectClass =
    aspect === "landscape"
      ? "aspect-[4/3] md:aspect-[5/4]"
      : "aspect-square md:aspect-square";

  return (
    <div className="w-full">
      {/* HERO */}
      <div
        className={`relative overflow-hidden rounded-xl border border-white/10 bg-neutral-900/40 ${aspectClass} shadow-lg`}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
          const x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
          const y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
          setOrigin({ x: x * 100, y: y * 100 });
        }}
      >
        {/* use a plain <img> to allow transform-origin scaling smoothly */}
        <img
          src={hero.url}
          alt={hero.alt ?? "Product image"}
          className="absolute inset-0 h-full w-full object-contain transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: hovering ? "scale(1.25)" : "scale(1)",
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
          draggable={false}
        />
      </div>

      {/* THUMBS */}
      {images.length > 1 && (
        <div className="mt-3 grid grid-cols-5 gap-2">
          {images.map((img, i) => {
            const isActive = i === active;
            return (
              <button
                key={`${img.url}-${i}`}
                onClick={() => setActive(i)}
                className={[
                  "group relative overflow-hidden rounded-lg border bg-neutral-900/40",
                  "aspect-square",
                  isActive
                    ? "border-emerald-500 ring-2 ring-emerald-500/30"
                    : "border-white/10 hover:border-white/25",
                ].join(" ")}
                aria-label={`Show image ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? `Thumbnail ${i + 1}`}
                  className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                  draggable={false}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
