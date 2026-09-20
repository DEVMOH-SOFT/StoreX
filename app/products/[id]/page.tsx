import React from 'react';
import Link from 'next/link';
import { fetchProductById } from '@/lib/supabase';
import ProductDetailView from '@/components/products/ProductDetailView';

export const revalidate = 60;

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await fetchProductById(params.id);

  if (!product) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">
          The gadget you are looking for might have been removed or is temporarily unavailable.
        </p>
        <Link
          href="/products"
          className="inline-block bg-[#0d2d9e] hover:bg-[#1142d4] text-white text-xs font-bold px-6 py-2.5 rounded-lg shadow-sm"
        >
          Return to Catalog
        </Link>
      </div>
    );
  }

  return <ProductDetailView product={product} />;
}
