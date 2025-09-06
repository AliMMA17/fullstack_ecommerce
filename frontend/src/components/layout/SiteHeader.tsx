"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, User2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const pathname = usePathname();
  // hide on the auth screen
  if (pathname?.toLowerCase().startsWith("/login")) return null;

  // demo cart badge (replace with real store later)
  const [cartQty, setCartQty] = useState(0);
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart:qty");
      setCartQty(raw ? parseInt(raw) : 0);
      const onStorage = (e: StorageEvent) => {
        if (e.key === "cart:qty") setCartQty(e.newValue ? parseInt(e.newValue) : 0);
      };
      window.addEventListener("storage", onStorage);
      return () => window.removeEventListener("storage", onStorage);
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b border-gray-200">
      <div className="page-wrap h-16 flex items-center justify-between">
        {/* Left: logo + nav */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="text-gray-900 font-semibold tracking-tight hover:text-emerald-600"
          >
            Diprella
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-gray-600">
            <Link href="/catalog" className="hover:text-gray-900">Catalog</Link>
          </nav>
        </div>

        {/* Right: user + cart */}
        <div className="flex items-center gap-1">
          <Link
            href="/account"
            className="relative inline-flex items-center rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Account"
          >
            <User2 className="h-5 w-5 text-gray-700" />
          </Link>

          <Link
            href="/cart"
            className="relative inline-flex items-center rounded-full p-2 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            {cartQty > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-4.5 px-1 grid place-items-center rounded-full bg-emerald-600 text-white text-[10px]">
                {cartQty > 99 ? "99+" : cartQty}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
