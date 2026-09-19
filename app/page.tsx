import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Truck, ShieldCheck, Headphones, RotateCcw, ChevronRight } from 'lucide-react';
import ProductCard from '@/components/products/ProductCard';
import { CATEGORIES } from '@/data/products';
import { Product, Category } from '@/types';

export const dynamic = 'force-dynamic';

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/products?featured=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch (e) {
    console.warn('[StoreX Home] Failed to fetch featured products from API:', e);
    return [];
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const res = await fetch(`${apiUrl}/api/categories`, { cache: 'no-store' });
    if (!res.ok) return CATEGORIES as Category[];
    const data = await res.json();
    return data.categories || CATEGORIES;
  } catch (e) {
    return CATEGORIES as Category[];
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts();
  const categories = await getCategories();

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="relative bg-[#050a1c] text-white overflow-hidden rounded-b-2xl lg:rounded-2xl max-w-7xl mx-auto my-0 lg:mt-4 shadow-2xl border border-slate-900">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/hero-banner.png"
            alt="StoreX Flagship Gadgets Showcase"
            fill
            priority
            className="object-cover object-right opacity-80 md:opacity-95"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050a1c] via-[#050a1c]/85 md:via-[#050a1c]/70 to-transparent max-w-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-16 lg:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-6 max-w-xl">
            <span className="inline-block text-[11px] font-extrabold tracking-widest text-blue-300 uppercase bg-[#0c2378]/90 px-3.5 py-1 rounded-full border border-blue-700/50 shadow-sm">
              WELCOME TO STOREX
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white">
              Smart Gadgets.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-200 to-indigo-200">
                Better Living.
              </span>
            </h1>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
              Discover the latest gadgets, top brands and amazing deals — all in one place.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/products"
                className="bg-[#0d2d9e] hover:bg-[#1142d4] text-white font-bold px-7 py-3.5 rounded-xl shadow-lg shadow-blue-950/60 transition-all flex items-center gap-2 group text-sm"
              >
                Shop Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/products?deals=true"
                className="bg-[#0c2378]/80 hover:bg-[#0c2378] text-slate-200 font-semibold px-6 py-3.5 rounded-xl border border-blue-800/80 transition-colors text-sm backdrop-blur-sm"
              >
                Explore Deals
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Highlights Strip */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0d2d9e] flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 text-xs font-bold">Free Delivery</h4>
              <p className="text-[11px] text-slate-500">On all orders over ₦50,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0d2d9e] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 text-xs font-bold">Secure Payment</h4>
              <p className="text-[11px] text-slate-500">100% safe and encrypted</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0d2d9e] flex items-center justify-center flex-shrink-0">
              <Headphones className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 text-xs font-bold">24/7 Support</h4>
              <p className="text-[11px] text-slate-500">We're here to help anytime</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0d2d9e] flex items-center justify-center flex-shrink-0">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-slate-900 text-xs font-bold">Easy Returns</h4>
              <p className="text-[11px] text-slate-500">Hassle-free within 7 days</p>
            </div>
          </div>
        </div>
      </section>

      {/* Shop by Category */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Shop by Category</h2>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#0d2d9e] hover:text-[#1142d4] flex items-center gap-1"
          >
            View all categories <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={`/products?category=${encodeURIComponent(cat.name)}`}
              className="group bg-white rounded-xl border border-slate-200/80 p-4 text-center hover:border-blue-300 hover:shadow-md transition-all flex flex-col items-center justify-between"
            >
              <div className="relative w-24 h-24 mb-3 rounded-lg overflow-hidden bg-slate-50 p-2">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  sizes="100px"
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 text-xs group-hover:text-[#0d2d9e] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 block mt-0.5">{cat.count}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Featured Products</h2>
            <p className="text-xs text-slate-500">Top picked flagship gadgets for you</p>
          </div>
          <Link
            href="/products"
            className="text-xs font-semibold text-[#0d2d9e] hover:text-[#1142d4] flex items-center gap-1"
          >
            Explore all <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {featuredProducts.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-xs text-slate-500">
            Connecting to StoreX API for featured products...
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
