import { notFound } from "next/navigation";
import VariantPicker, { type Variant } from "@/components/catalog/VariantPicker";
import Gallery, { type GalleryImage } from "@/components/catalog/Gallery";
import { formatMoney } from "@/lib/money";

type Product = {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "active" | "archived";
  description: string | null;
  brand: string | null;
  default_currency: string;
  created_at: string;
  updated_at: string;
  variants: Variant[];
};

const CATALOG_BASE =
  (process.env.NEXT_PUBLIC_CATALOG_URL ?? "http://localhost:8001").replace(/\/$/, "");
const MEDIA_BASE =
  (process.env.NEXT_PUBLIC_MEDIA_URL ?? "http://localhost:8003").replace(/\/$/, "");

async function getProduct(id: string): Promise<Product> {
  const res = await fetch(`${CATALOG_BASE}/catalog/products/${id}`, {
    // during active dev you can use: cache: "no-store"
    next: { revalidate: 30 },
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load product");
  return res.json();
}

async function getImages(productId: string): Promise<GalleryImage[]> {
  const res = await fetch(`${MEDIA_BASE}/products/${productId}/images`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.items ?? []).map((it: any) => ({
    // Make absolute URLs for the browser:
    url: `${MEDIA_BASE}${it.url}`,
    alt: it.alt ?? null,
  }));
}

export default async function ProductPage({
  params,
}: {
  // Next 15: params is a Promise
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, images] = await Promise.all([
    getProduct(id),
    getImages(id),
  ]);

  const numericPrices = (product.variants ?? [])
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n));
  const minPrice = numericPrices.length ? Math.min(...numericPrices) : null;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm">
        <a href="/" className="text-emerald-700 hover:underline">Home</a>
        <span className="mx-2 text-slate-400">/</span>
        <a href="/catalog" className="text-emerald-700 hover:underline">Catalog</a>
        <span className="mx-2 text-slate-400">/</span>
        <span className="text-slate-600">{product.title}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: image gallery */}
        <section>
          <Gallery images={images} />
        </section>

        {/* Right: details */}
        <section>
          <h1 className="text-3xl font-bold text-slate-900">{product.title}</h1>
          {product.brand && <div className="mt-1 text-slate-600">by {product.brand}</div>}

          {minPrice !== null && product.variants.length > 1 && (
            <div className="mt-3 text-lg text-slate-700">
              From {formatMoney(minPrice, product.default_currency)}
            </div>
          )}

          {product.description && (
            <p className="mt-6 text-slate-700 leading-relaxed">{product.description}</p>
          )}

          <div className="mt-8">
            <VariantPicker
              currency={product.default_currency}
              variants={product.variants}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1">
              In stock
            </span>
            <span className="rounded-full bg-slate-50 text-slate-700 border border-slate-200 px-3 py-1">
              Free returns
            </span>
          </div>
        </section>
      </div>

      {/* More info / specs */}
      <section className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div>
          <h2 className="text-lg font-semibold">Details</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            <li>Status: <span className="text-slate-600">{product.status}</span></li>
            <li>SKU(s): <span className="text-slate-600">{product.variants.map(v => v.sku).join(", ")}</span></li>
            <li>Updated: <span className="text-slate-600">{new Date(product.updated_at).toLocaleString()}</span></li>
          </ul>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Shipping & returns</h2>
          <p className="mt-3 text-sm text-slate-700">
            Ships in 1–2 business days. Free returns within 30 days.
          </p>
        </div>
      </section>
    </main>
  );
}
