import { notFound } from "next/navigation";
import VariantPicker, { type Variant } from "@/components/catalog/VariantPicker";
import ProductGallery from "@/components/catalog/ProductGallery";
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
    next: { revalidate: 30 },
  });
  if (res.status === 404) notFound();
  if (!res.ok) throw new Error("Failed to load product");
  return res.json();
}

type GalleryImg = { url: string; alt?: string | null };
async function getImages(productId: string): Promise<GalleryImg[]> {
  const res = await fetch(`${MEDIA_BASE}/products/${productId}/images`, {
    next: { revalidate: 30 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return (data?.items ?? []).map((it: any) => ({
    url: `${MEDIA_BASE}${it.url}`,
    alt: it.alt ?? null,
  }));
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, images] = await Promise.all([getProduct(id), getImages(id)]);

  const numericPrices = (product.variants ?? [])
    .map((v) => Number(v.price))
    .filter((n) => Number.isFinite(n));
  const minPrice = numericPrices.length ? Math.min(...numericPrices) : null;

  return (
    <main className="page-wrap py-8 lg:py-10 bg-white">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <a href="/" className="hover:text-emerald-600">Home</a>
        <span className="mx-2">/</span>
        <a href="/catalog" className="hover:text-emerald-600">Catalog</a>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{product.title}</span>
      </nav>

      {/* Two-column layout */}
      <div
        className="
          grid gap-8 items-start
          lg:grid-cols-[minmax(0,760px)_minmax(420px,1fr)]
          xl:grid-cols-[minmax(0,820px)_minmax(460px,1fr)]
        "
      >
        {/* Left: gallery - white card, neutral border */}
        <section className="rounded-2xl border border-gray-200 bg-white">
          <ProductGallery images={images} aspect="landscape" />
        </section>

        {/* Right: details - white card, neutral border */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">{product.title}</h1>
          {product.brand && <div className="mt-1 text-emerald-600">by {product.brand}</div>}

          {minPrice !== null && product.variants.length > 1 && (
            <div className="mt-4 text-lg text-gray-700">
              From{" "}
              <span className="font-semibold text-gray-900">
                {formatMoney(minPrice, product.default_currency)}
              </span>
            </div>
          )}

          {product.description && (
            <p className="mt-6 leading-relaxed text-gray-700">{product.description}</p>
          )}

          <div className="mt-8">
            <label className="mb-2 block text-sm font-medium text-gray-600">
              Choose variant
            </label>
            <VariantPicker
              currency={product.default_currency}
              variants={product.variants}
            />
          </div>

          <div className="mt-6 flex flex-wrap gap-2 text-xs">
            <span className="badge-brand">In stock</span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-gray-700">
              Free returns
            </span>
          </div>
        </section>
      </div>

      {/* Info blocks */}
      <section className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Details</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              Status: <span className="text-gray-700">{product.status}</span>
            </li>
            <li>
              SKU(s):{" "}
              <span className="text-gray-700">
                {product.variants.map((v) => v.sku).join(", ")}
              </span>
            </li>
            <li>
              Updated:{" "}
              <span className="text-gray-700">
                {new Date(product.updated_at).toLocaleString()}
              </span>
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-gray-900">Shipping & returns</h2>
          <p className="mt-3 text-sm text-gray-700">
            Ships in 1–2 business days. Free returns within 30 days.
          </p>
        </div>
      </section>
    </main>
  );
}
