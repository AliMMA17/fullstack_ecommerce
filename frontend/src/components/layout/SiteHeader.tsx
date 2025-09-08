"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Search, ShoppingCart, User2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function SiteHeader() {
  const pathname = usePathname();
  // Hide header on the auth screen
  if (pathname?.toLowerCase().startsWith("/login")) return null;

  // --- Demo state (replace with real data later) ---
  const [cartQty, setCartQty] = useState(0);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    try {
      // cart demo
      const raw = localStorage.getItem("cart:qty");
      setCartQty(raw ? parseInt(raw) : 0);
      const onStorage = (e: StorageEvent) => {
        if (e.key === "cart:qty") setCartQty(e.newValue ? parseInt(e.newValue) : 0);
      };
      window.addEventListener("storage", onStorage);

      // notifications demo
      const rawN = localStorage.getItem("notif:unread");
      setUnread(rawN ? parseInt(rawN) : 0);

      return () => window.removeEventListener("storage", onStorage);
    } catch {}
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-200">
      <div className="page-wrap h-16 flex items-center gap-3">
        {/* Left: logo + top links */}
        <div className="flex items-center gap-6 shrink-0">
          <Link
            href="/"
            className="text-gray-900 font-semibold tracking-tight hover:text-emerald-600"
          >
            Ali Rashchi Ecommerce
          </Link>
          <nav className="hidden md:flex items-center gap-5 text-sm text-gray-600">
            <Link href="/catalog" className="hover:text-gray-900">
              Catalog
            </Link>
          </nav>
        </div>

        {/* Center: search (md+) — not wired yet */}
        <form
          role="search"
          className="hidden md:flex flex-1 justify-center px-2"
          onSubmit={(e) => e.preventDefault()}
        >
          <label htmlFor="site-search" className="sr-only">
            Search products
          </label>
          <div className="relative w-full max-w-3xl">
            <input
              id="site-search"
              className="w-full h-10 rounded-full border border-gray-300 bg-gray-100/70
                         pl-10 pr-24 text-sm text-gray-900 placeholder:text-gray-500
                         focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500
                         focus:bg-white transition"
              placeholder="Search products, brands, categories…"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2
                         rounded-full px-4 py-1.5 text-sm font-medium text-white
                         bg-emerald-600 hover:bg-emerald-700 active:translate-y-[1px]"
            >
              Search
            </button>
          </div>
        </form>

        {/* Right: actions */}
        <div className="ml-auto flex items-center gap-1">
          {/* On small screens show a compact search button */}
          <Link
            href="/search"
            className="md:hidden inline-flex items-center rounded-full p-2
                       hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Search"
          >
            <Search className="h-5 w-5 text-gray-700" />
          </Link>

          {/* Notifications */}
          <Link
            href="/notifications"
            className="relative inline-flex items-center rounded-full p-2
                       hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-gray-700" />
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full
                           bg-rose-500 ring-2 ring-white"
                aria-hidden="true"
              />
            )}
          </Link>

          {/* Account */}
          <Link
            href="/account"
            className="relative inline-flex items-center rounded-full p-2
                       hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Account"
          >
            <User2 className="h-5 w-5 text-gray-700" />
          </Link>

          {/* Cart */}
          <Link
            href="/cart"
            className="relative inline-flex items-center rounded-full p-2
                       hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            aria-label="Cart"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
            {cartQty > 0 && (
              <span
                className="absolute -top-1 -right-1 min-w-[1.1rem] h-4.5 px-1
                           grid place-items-center rounded-full bg-emerald-600 text-white text-[10px] leading-none"
              >
                {cartQty > 99 ? "99+" : cartQty}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
