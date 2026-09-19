'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Heart, ShoppingCart, Check } from 'lucide-react';
import { Product } from '@/types';
import { formatNGN } from '@/data/products';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';

export default function ProductCard({ product }: { product: Product }) {
  const { addToCart, cart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);
  const inCart = cart.some((item) => item.product.id === product.id);

  return (
    <div className="group bg-white rounded-xl border border-slate-200/80 p-3 flex flex-col justify-between hover:shadow-xl hover:border-blue-300 transition-all duration-300 relative">
      {/* Top Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
            New
          </span>
        )}
        {product.discountBadge && (
          <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-md shadow-sm">
            -{product.discountBadge}
          </span>
        )}
      </div>

      {/* Wishlist Icon Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 flex items-center justify-center transition-all shadow-sm ${
          isWishlisted ? 'text-rose-500 bg-rose-50 border-rose-200' : 'text-slate-400 hover:text-rose-500 hover:scale-110'
        }`}
        aria-label="Add to wishlist"
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image Link - Optimized for Large Crisp Display */}
      <Link href={`/products/${product.id}`} className="block relative aspect-square w-full rounded-lg overflow-hidden bg-slate-50/80 mb-3">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-contain p-1 sm:p-2 group-hover:scale-110 transition-transform duration-300 ease-out"
        />
      </Link>

      {/* Product Info */}
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/products/${product.id}`} className="block">
            <h3 className="font-bold text-slate-900 text-sm hover:text-[#0d2d9e] transition-colors line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 my-1.5">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating}</span>
            <span className="text-[11px] text-slate-400 font-medium">({product.reviewCount})</span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="font-black text-slate-900 text-sm sm:text-base tracking-tight">
              {formatNGN(product.price)}
            </div>
            {product.oldPrice && (
              <div className="text-[11px] text-slate-400 line-through font-medium">
                {formatNGN(product.oldPrice)}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
              inCart
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-[#0d2d9e] text-white hover:bg-[#1142d4] shadow-md shadow-blue-900/20 active:scale-95'
            }`}
            title={inCart ? 'Added to Cart' : 'Add to Cart'}
          >
            {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
